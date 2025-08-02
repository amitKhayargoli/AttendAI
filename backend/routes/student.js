const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('Auth middleware - headers:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('Auth middleware - token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Create new student
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, email, personal_email, password, course_id, contact, enrollment_date } = req.body;

    // Validate required fields
    if (!name || !email || !password || !course_id || !contact || !enrollment_date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'course_id', 'contact', 'enrollment_date']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate personal email format if provided
    if (personal_email && !emailRegex.test(personal_email)) {
      return res.status(400).json({ error: 'Invalid personal email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate enrollment date
    const enrollmentDate = new Date(enrollment_date);
    const today = new Date();
    if (enrollmentDate > today) {
      return res.status(400).json({ error: 'Enrollment date cannot be in the future' });
    }

    // Check if student already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .single();

    if (existingStudent) {
      return res.status(409).json({ error: 'Student with this email already exists' });
    }

    // Check if personal email is already taken by another student
    if (personal_email) {
      const { data: existingPersonalEmail, error: personalEmailError } = await supabase
        .from('students')
        .select('id')
        .eq('personal_email', personal_email)
        .single();

      if (existingPersonalEmail) {
        return res.status(409).json({ error: 'Student with this personal email already exists' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Get college_id from admin's JWT token
    const adminEmail = req.user.email;
    const domain = adminEmail.split('@')[1].split('.')[0];
    
    // Get college_id based on domain
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('domain', domain)
      .single();

    if (collegeError || !college) {
      return res.status(400).json({ error: 'College not found for this domain' });
    }

    // Validate course_id and get course name
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, name, code')
      .eq('id', course_id)
      .eq('college_id', college.id)
      .single();

    if (courseError || !course) {
      return res.status(400).json({ error: 'Course not found or not from this college' });
    }

    // Create student object (include both course_id and course name)
    const studentData = {
      name: name.trim(),
      email: email.toLowerCase(),
      personal_email: personal_email ? personal_email.toLowerCase() : null,
      password_hash,
      course: course.name, // Store course name for display
      contact,
      enrollment_date: enrollment_date,
      college_id: college.id,
      face_descriptor: null // Optional for now
    };

    // Insert student into database
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert([studentData])
      .select('id, name, email, personal_email, course, contact, enrollment_date, college_id, created_at')
      .single();

    if (insertError) {
      console.error('Student creation error:', insertError);
      return res.status(400).json({ 
        error: 'Failed to create student', 
        details: insertError.message 
      });
    }

    // Create entry in student_courses table
    const { error: studentCourseError } = await supabase
      .from('student_courses')
      .insert([{
        student_id: newStudent.id,
        course_id: course_id
      }]);

    if (studentCourseError) {
      console.error('Error creating student-course relationship:', studentCourseError);
      // Note: We don't fail the entire operation if this fails, just log it
    }

    // Get all subjects for this course and enroll student in them
    const { data: courseSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id')
      .eq('course_id', course_id);

    if (!subjectsError && courseSubjects && courseSubjects.length > 0) {
      const studentSubjectEntries = courseSubjects.map(subject => ({
        student_id: newStudent.id,
        subject_id: subject.id
      }));

      const { error: studentSubjectError } = await supabase
        .from('student_subjects')
        .insert(studentSubjectEntries);

      if (studentSubjectError) {
        console.error('Error creating student-subject relationships:', studentSubjectError);
        // Note: We don't fail the entire operation if this fails, just log it
      }
    }

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        personal_email: newStudent.personal_email,
        course: newStudent.course,
        contact: newStudent.contact,
        enrollment_date: newStudent.enrollment_date,
        college_id: newStudent.college_id,
        created_at: newStudent.created_at
      },
      course: {
        id: course.id,
        name: course.name,
        code: course.code
      },
      credentials: {
        email: newStudent.email,
        password: password // Return plain password for admin to share with student
      }
    });

  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all students for admin's college
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get admin's college_id
    const adminEmail = req.user.email;
    const domain = adminEmail.split('@')[1].split('.')[0];
    
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('domain', domain)
      .single();

    if (collegeError || !college) {
      return res.status(400).json({ error: 'College not found' });
    }

    // Get students for this college (include course field)
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, email, personal_email, course, contact, enrollment_date, created_at')
      .eq('college_id', college.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      return res.status(400).json({ error: 'Failed to fetch students' });
    }

    res.json({
      students,
      count: students.length
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student's face descriptor
router.put('/face-descriptor', authenticateToken, async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    const studentEmail = req.user.email;

    // Validate face descriptor
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ 
        error: 'Face descriptor is required and must be an array' 
      });
    }

    // Check if face descriptor has the correct length (128 for face-api.js)
    if (faceDescriptor.length !== 128) {
      return res.status(400).json({ 
        error: 'Invalid face descriptor format. Expected 128 values.' 
      });
    }

    // Get student's details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('email', studentEmail)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the student's face descriptor
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({ 
        face_descriptor: faceDescriptor 
      })
      .eq('id', student.id)
      .select('id, name, email')
      .single();

    if (updateError) {
      console.error('Error updating face descriptor:', updateError);
      return res.status(500).json({ error: 'Failed to save face descriptor' });
    }

    res.json({ 
      message: 'Face descriptor saved successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error in PUT /student/face-descriptor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's face descriptor (for verification)
router.get('/face-descriptor', authenticateToken, async (req, res) => {
  try {
    const studentEmail = req.user.email;

    // Get student's face descriptor
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email, face_descriptor')
      .eq('email', studentEmail)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      hasFaceDescriptor: !!student.face_descriptor,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Error in GET /student/face-descriptor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's face descriptor data
router.get('/face-descriptor-data', authenticateToken, async (req, res) => {
  try {
    const studentEmail = req.user.email;

    // Get student's face descriptor
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email, face_descriptor')
      .eq('email', studentEmail)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.face_descriptor) {
      return res.status(404).json({ error: 'No face descriptor found' });
    }

    res.json({ 
      faceDescriptor: student.face_descriptor,
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Error in GET /student/face-descriptor-data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all courses for student enrollment
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    // Get admin's college_id
    const adminEmail = req.user.email;
    const domain = adminEmail.split('@')[1].split('.')[0];
    
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('domain', domain)
      .single();

    if (collegeError || !college) {
      return res.status(400).json({ error: 'College not found' });
    }

    // Get courses for this college
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, name, code, description')
      .eq('college_id', college.id)
      .order('name');

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(400).json({ error: 'Failed to fetch courses' });
    }

    res.json({ courses });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email, personal_email, course, contact, enrollment_date, created_at')
      .eq('id', id)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, personal_email, course, contact, enrollment_date } = req.body;
    
    console.log('Update request for student ID:', id);
    console.log('Update data:', { name, email, personal_email, course, contact, enrollment_date });

    // Validate required fields
    if (!name || !email || !course || !contact || !enrollment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if student exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if email is already taken by another student (excluding current student)
    const { data: emailCheck, error: emailError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle();

    if (emailCheck) {
      return res.status(409).json({ error: 'Email already taken by another student' });
    }

    // Check if personal email is already taken by another student (excluding current student)
    if (personal_email) {
      const { data: personalEmailCheck, error: personalEmailError } = await supabase
        .from('students')
        .select('id')
        .eq('personal_email', personal_email)
        .neq('id', id)
        .maybeSingle();

      if (personalEmailCheck) {
        return res.status(409).json({ error: 'Personal email already taken by another student' });
      }
    }

    // Update student
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        email: email.toLowerCase(),
        personal_email: personal_email ? personal_email.toLowerCase() : null,
        course,
        contact,
        enrollment_date
      })
      .eq('id', id)
      .select('id, name, email, personal_email, course, contact, enrollment_date, created_at')
      .single();

    if (updateError) {
      console.error('Student update error:', updateError);
      return res.status(400).json({ error: 'Failed to update student', details: updateError.message });
    }
    res.json({
       message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete student
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Student deletion error:', deleteError);
      return res.status(400).json({ error: 'Failed to delete student' });
    }

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student profile (for logged-in student)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const studentEmail = req.user.email;

    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email, personal_email, course, contact, enrollment_date, created_at')
      .eq('email', studentEmail)
      .single();

    if (error || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });

  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search students
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const adminEmail = req.user.email;
    const domain = adminEmail.split('@')[1].split('.')[0];
    
    // Get college_id
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('domain', domain)
      .single();

    if (collegeError || !college) {
      return res.status(400).json({ error: 'College not found' });
    }

    // Search students by name, email, or course
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, email, personal_email, course, contact, enrollment_date, created_at')
      .eq('college_id', college.id)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,course.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search error:', error);
      return res.status(400).json({ error: 'Search failed' });
    }

    res.json({
      students,
      count: students.length,
      query
    });

  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
