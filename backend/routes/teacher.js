const express = require('express');
const bcrypt = require('bcryptjs');
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

// Create new teacher
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, email, personal_email, password, contact, joined_at } = req.body;

    // Validate required fields
    if (!name || !email || !password || !contact || !joined_at) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'password', 'contact', 'joined_at']
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

    // Validate joined date
    const joinedDate = new Date(joined_at);
    const today = new Date();
    if (joinedDate > today) {
      return res.status(400).json({ error: 'Joined date cannot be in the future' });
    }

    // Check if teacher already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingTeacher) {
      return res.status(409).json({ error: 'Teacher with this email already exists' });
    }

    // Check if personal email is already taken by another teacher
    if (personal_email) {
      const { data: existingPersonalEmail, error: personalEmailError } = await supabase
        .from('teachers')
        .select('id')
        .eq('personal_email', personal_email)
        .single();

      if (existingPersonalEmail) {
        return res.status(409).json({ error: 'Teacher with this personal email already exists' });
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

    // Create teacher object
    const teacherData = {
      name: name.trim(),
      email: email.toLowerCase(),
      personal_email: personal_email ? personal_email.toLowerCase() : null,
      password_hash,
      contact,
      joined_at: joined_at,
      college_id: college.id
    };

    // Insert teacher into database
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert([teacherData])
      .select('id, name, email, personal_email, contact, joined_at, college_id, created_at')
      .single();

    if (insertError) {
      console.error('Teacher creation error:', insertError);
      return res.status(400).json({ 
        error: 'Failed to create teacher', 
        details: insertError.message 
      });
    }

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        personal_email: newTeacher.personal_email,
        contact: newTeacher.contact,
        joined_at: newTeacher.joined_at,
        college_id: newTeacher.college_id,
        created_at: newTeacher.created_at
      },
      credentials: {
        email: newTeacher.email,
        password: password // Return plain password for admin to share with teacher
      }
    });

  } catch (error) {
    console.error('Teacher creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all teachers for admin's college
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

    // Get teachers for this college
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, email, personal_email, contact, joined_at, created_at')
      .eq('college_id', college.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teachers:', error);
      return res.status(400).json({ error: 'Failed to fetch teachers' });
    }

    res.json({
      teachers,
      count: teachers.length
    });

  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id, name, email, personal_email, contact, joined_at, created_at')
      .eq('id', id)
      .single();

    if (error || !teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ teacher });

  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update teacher
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, personal_email, contact, joined_at } = req.body;
    
    console.log('Update request for teacher ID:', id);
    console.log('Update data:', { name, email, personal_email, contact, joined_at });

    // Validate required fields
    if (!name || !email || !contact || !joined_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if teacher exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if email is already taken by another teacher (excluding current teacher)
    const { data: emailCheck, error: emailError } = await supabase
      .from('teachers')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle();

    if (emailCheck) {
      return res.status(409).json({ error: 'Email already taken by another teacher' });
    }

    // Check if personal email is already taken by another teacher (excluding current teacher)
    if (personal_email) {
      const { data: personalEmailCheck, error: personalEmailError } = await supabase
        .from('teachers')
        .select('id')
        .eq('personal_email', personal_email)
        .neq('id', id)
        .maybeSingle();

      if (personalEmailCheck) {
        return res.status(409).json({ error: 'Personal email already taken by another teacher' });
      }
    }

    // Update teacher
    const { data: updatedTeacher, error: updateError } = await supabase
      .from('teachers')
      .update({
        name: name.trim(),
        email: email.toLowerCase(),
        personal_email: personal_email ? personal_email.toLowerCase() : null,
        contact,
        joined_at
      })
      .eq('id', id)
      .select('id, name, email, personal_email, contact, joined_at, created_at')
      .single();

    if (updateError) {
      console.error('Teacher update error:', updateError);
      return res.status(400).json({ error: 'Failed to update teacher', details: updateError.message });
    }

    res.json({
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete teacher
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete teacher
    const { error: deleteError } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Teacher deletion error:', deleteError);
      return res.status(400).json({ error: 'Failed to delete teacher' });
    }

    res.json({ message: 'Teacher deleted successfully' });

  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search teachers
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

    // Search teachers by name, email, or contact
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('id, name, email, personal_email, contact, joined_at, created_at')
      .eq('college_id', college.id)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,contact.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search error:', error);
      return res.status(400).json({ error: 'Search failed' });
    }

    res.json({
      teachers,
      count: teachers.length,
      query
    });

  } catch (error) {
    console.error('Search teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
