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
    const { name, email, password, collegeDomain } = req.body;

    if (!name || !email || !password || !collegeDomain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Find or create the college
    let { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('*')
      .eq('domain', collegeDomain)
      .single();

    if (collegeError && collegeError.code !== 'PGRST116') { // PGRST116: No rows found
      return res.status(400).json({ error: 'Error checking college', details: collegeError.message });
    }

    if (!college) {
      // Create the college
      const { data: newCollege, error: createError } = await supabase
        .from('colleges')
        .insert([{ name: collegeDomain, domain: collegeDomain }])
        .select()
        .single();
      if (createError) {
        return res.status(400).json({ error: 'Error creating college', details: createError.message });
      }
      college = newCollege;
    }

    // 2. Check if admin already exists
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Admin with this email already exists' });
    }

    // 3. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Insert admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          name,
          email,
          password_hash,
          college_id: college.id
        }
      ])
      .select()
      .single();

    if (adminError) {
      return res.status(400).json({ error: 'Registration failed', details: adminError.message });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        college_id: admin.college_id
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Infer userType from email (using .includes)
    let userType;
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('admin')) {
      userType = 'admin';
    } else if (lowerEmail.includes('faculty') || lowerEmail.includes('teacher')) {
      userType = 'teacher';
    } else if (lowerEmail.includes('student')) {
      userType = 'student';
    } else {
      // fallback: try all user tables in order
      const tables = ['admins', 'teachers', 'students'];
      for (const table of tables) {
        const { data: user, error } = await supabase
          .from(table)
          .select('*')
          .eq('email', email)
          .single();
        if (user) {
          userType = table.slice(0, -1); // remove 's'
          break;
        }
      }
      if (!userType) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
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

// Admin login with college domain
router.post('/admin-login', async (req, res) => {
  try {
    const { collegeDomain, password } = req.body;

    if (!collegeDomain || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const email = `admin@${collegeDomain}.edu.np`;

    // Get admin from database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        college_id: admin.college_id
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
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