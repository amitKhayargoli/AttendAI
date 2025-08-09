const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, collegeId, course, contact } = req.body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let userData = {
      name,
      email,
      password_hash: passwordHash,
      college_id: collegeId
    };

    // Add type-specific fields
    if (userType === 'student') {
      userData.course = course;
      userData.contact = contact;
    } else if (userType === 'teacher') {
      userData.contact = contact;
    }

    // Insert user based on type
    const { data, error } = await supabase
      .from(userType + 's') // students, teachers, admins
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ error: 'Registration failed', details: error.message });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: data.id, email: data.email, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        userType
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new admin
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password, college_id } = req.body;

    if (!name || !email || !password || !college_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if admin already exists
    const { data: existing, error: existingError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Admin with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert admin
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          id: uuidv4(),
          name,
          email,
          password_hash,
          college_id
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Registration failed', details: error.message });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: data.id, email: data.email, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: data.id,
        name: data.name,
        email: data.email,
        college_id: data.college_id
      },
      token
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from(userType + 's')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from(decoded.userType + 's')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: decoded.userType
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 