const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

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

// Create new subject
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, code, level, teacher_id, course_id } = req.body;

    // Validate required fields
    if (!name || !code || !level) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'code', 'level']
      });
    }

    // Validate code format (alphanumeric, 3-10 characters)
    const codeRegex = /^[A-Za-z0-9]{3,10}$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({ error: 'Subject code must be 3-10 alphanumeric characters' });
    }

    // Validate level (should be one of the predefined levels)
    const validLevels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level. Must be one of: First Year, Second Year, Third Year, Fourth Year' });
    }

    // Check if subject code already exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existingSubject) {
      return res.status(409).json({ error: 'Subject with this code already exists' });
    }

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

    // Validate teacher_id if provided
    if (teacher_id) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', teacher_id)
        .eq('college_id', college.id)
        .single();

      if (teacherError || !teacher) {
        return res.status(400).json({ error: 'Teacher not found or not from this college' });
      }
    }

    // Validate course_id if provided
    if (course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', course_id)
        .eq('college_id', college.id)
        .single();

      if (courseError || !course) {
        return res.status(400).json({ error: 'Course not found or not from this college' });
      }
    }

    // Create subject object
    const subjectData = {
      name: name.trim(),
      code: code.toUpperCase(),
      level,
      teacher_id: teacher_id || null,
      course_id: course_id || null,
      college_id: college.id
    };

    // Insert subject into database
    const { data: newSubject, error: insertError } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select('id, name, code, level, teacher_id, course_id, college_id, created_at')
      .single();

    if (insertError) {
      console.error('Subject creation error:', insertError);
      return res.status(400).json({ 
        error: 'Failed to create subject', 
        details: insertError.message 
      });
    }

    // If teacher_id is provided, create entry in teachers_subjects table
    if (teacher_id) {
      const { error: teacherSubjectError } = await supabase
        .from('teachers_subjects')
        .insert([{
          teacher_id: teacher_id,
          subject_id: newSubject.id
        }]);

      if (teacherSubjectError) {
        console.error('Error creating teacher-subject relationship:', teacherSubjectError);
        // Note: We don't fail the entire operation if this fails, just log it
      }
    }

    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        id: newSubject.id,
        name: newSubject.name,
        code: newSubject.code,
        level: newSubject.level,
        teacher_id: newSubject.teacher_id,
        course_id: newSubject.course_id,
        college_id: newSubject.college_id,
        created_at: newSubject.created_at
      }
    });

  } catch (error) {
    console.error('Subject creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all subjects for admin's college
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

    // Get subjects for this college with teacher and course information
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        id, 
        name, 
        code, 
        level, 
        teacher_id, 
        course_id,
        created_at,
        teachers!inner(name),
        courses!inner(name, code)
      `)
      .eq('college_id', college.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subjects:', error);
      return res.status(400).json({ error: 'Failed to fetch subjects' });
    }

    // Format the response to include teacher and course names
    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      level: subject.level,
      teacher_id: subject.teacher_id,
      teacher_name: subject.teachers?.name || 'Unassigned',
      course_id: subject.course_id,
      course_name: subject.courses?.name || null,
      course_code: subject.courses?.code || null,
      created_at: subject.created_at
    }));

    res.json({
      subjects: formattedSubjects,
      count: formattedSubjects.length
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all teachers for subject assignment
router.get('/teachers', authenticateToken, async (req, res) => {
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

    // Get teachers for this college
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, email')
      .eq('college_id', college.id)
      .order('name');

    if (error) {
      console.error('Error fetching teachers:', error);
      return res.status(400).json({ error: 'Failed to fetch teachers' });
    }

    res.json({ teachers });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('id, name, code, level, teacher_id, created_at')
      .eq('id', id)
      .single();

    if (error || !subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ subject });

  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subject
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, level, teacher_id } = req.body;
    
    console.log('Update request for subject ID:', id);
    console.log('Update data:', { name, code, level, teacher_id });

    // Validate required fields
    if (!name || !code || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate code format
    const codeRegex = /^[A-Za-z0-9]{3,10}$/;
    if (!codeRegex.test(code)) {
      return res.status(400).json({ error: 'Subject code must be 3-10 alphanumeric characters' });
    }

    // Validate level
    const validLevels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    // Check if subject exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Check if code is already taken by another subject
    const { data: codeCheck, error: codeError } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code.toUpperCase())
      .neq('id', id)
      .maybeSingle();

    if (codeCheck) {
      return res.status(409).json({ error: 'Subject code already taken by another subject' });
    }

    // Get college_id for teacher validation
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

    // Validate teacher_id if provided
    if (teacher_id) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', teacher_id)
        .eq('college_id', college.id)
        .single();

      if (teacherError || !teacher) {
        return res.status(400).json({ error: 'Teacher not found or not from this college' });
      }
    }

    // Update subject
    const { data: updatedSubject, error: updateError } = await supabase
      .from('subjects')
      .update({
        name: name.trim(),
        code: code.toUpperCase(),
        level,
        teacher_id: teacher_id || null
      })
      .eq('id', id)
      .select('id, name, code, level, teacher_id, created_at')
      .single();

    if (updateError) {
      console.error('Subject update error:', updateError);
      return res.status(400).json({ error: 'Failed to update subject', details: updateError.message });
    }

    res.json({
      message: 'Subject updated successfully',
      subject: updatedSubject
    });

  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subject
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject exists
    const { data: existingSubject, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Delete subject
    const { error: deleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Subject deletion error:', deleteError);
      return res.status(400).json({ error: 'Failed to delete subject' });
    }

    res.json({ message: 'Subject deleted successfully' });

  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search subjects
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

    // Search subjects by name, code, or level
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        id, 
        name, 
        code, 
        level, 
        teacher_id, 
        created_at,
        teachers!inner(name)
      `)
      .eq('college_id', college.id)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,level.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search error:', error);
      return res.status(400).json({ error: 'Search failed' });
    }

    // Format the response
    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      level: subject.level,
      teacher_id: subject.teacher_id,
      teacher_name: subject.teachers?.name || 'Unassigned',
      created_at: subject.created_at
    }));

    res.json({
      subjects: formattedSubjects,
      count: formattedSubjects.length,
      query
    });

  } catch (error) {
    console.error('Search subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 