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
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Create new student
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, course, contact, enrollment_date } = req.body;

    // Validate required fields
    if (!name || !email || !password || !course || !contact || !enrollment_date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'course', 'contact', 'enrollment_date']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
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

    // Create student object
    const studentData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password_hash,
      course,
      contact,
      enrollment_date: enrollment_date,
      college_id: college.id,
      face_descriptor: null // Optional for now
    };

    // Insert student into database
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert([studentData])
      .select('id, name, email, course, contact, enrollment_date, college_id, created_at')
      .single();

    if (insertError) {
      console.error('Student creation error:', insertError);
      return res.status(400).json({ 
        error: 'Failed to create student', 
        details: insertError.message 
      });
    }

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        course: newStudent.course,
        contact: newStudent.contact,
        enrollment_date: newStudent.enrollment_date,
        college_id: newStudent.college_id,
        created_at: newStudent.created_at
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

    // Get students for this college
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, email, course, contact, enrollment_date, created_at')
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

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email, course, contact, enrollment_date, created_at')
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
    const { name, email, course, contact, enrollment_date } = req.body;

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

    // Check if email is already taken by another student
    const { data: emailCheck, error: emailError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single();

    if (emailCheck) {
      return res.status(409).json({ error: 'Email already taken by another student' });
    }

    // Update student
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({
        name: name.trim(),
        email: email.toLowerCase(),
        course,
        contact,
        enrollment_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, email, course, contact, enrollment_date, updated_at')
      .single();

    if (updateError) {
      console.error('Student update error:', updateError);
      return res.status(400).json({ error: 'Failed to update student' });
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
      .select('id, name, email, course, contact, enrollment_date, created_at')
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
