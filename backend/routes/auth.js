const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { sendOTPEmail } = require('../utils/emailService');

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

// Request OTP for password reset
router.post('/request-otp', async (req, res) => {
  try {
    const { personal_email } = req.body;

    if (!personal_email) {
      return res.status(400).json({ error: 'Personal email is required' });
    }

    // Check if user exists with this personal email
    let user = null;
    let userType = null;

    // Check in students table
    const { data: student } = await supabase
      .from('students')
      .select('id, name, personal_email')
      .eq('personal_email', personal_email)
      .single();

    if (student) {
      user = student;
      userType = 'student';
    } else {
      // Check in teachers table
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, name, personal_email')
        .eq('personal_email', personal_email)
        .single();

      if (teacher) {
        user = teacher;
        userType = 'teacher';
      } else {
        // Check in admins table
        const { data: admin } = await supabase
          .from('admins')
          .select('id, name, email')
          .eq('email', personal_email)
          .single();

        if (admin) {
          user = admin;
          userType = 'admin';
        }
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'No user found with this email address' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now

    // Delete any existing OTP requests for this email
    await supabase
      .from('otp_requests')
      .delete()
      .eq('personal_email', personal_email);

    // Create new OTP request
    const { error: otpError } = await supabase
      .from('otp_requests')
      .insert({
        personal_email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error('Error creating OTP:', otpError);
      return res.status(500).json({ error: 'Failed to create OTP' });
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(personal_email, otpCode);
    
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.message);
      return res.status(500).json({ 
        error: 'Failed to send OTP email',
        details: emailResult.message 
      });
    }

    res.json({
      message: 'OTP sent successfully to your email',
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
      expires_in: '1 minute'
    });

  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { personal_email, otp_code } = req.body;

    if (!personal_email || !otp_code) {
      return res.status(400).json({ error: 'Personal email and OTP code are required' });
    }

    // Find the OTP request
    const { data: otpRequest, error } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('personal_email', personal_email)
      .eq('otp_code', otp_code)
      .single();

    if (error || !otpRequest) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpRequest.expires_at);
    
    if (now > expiresAt) {
      // Delete expired OTP
      await supabase
        .from('otp_requests')
        .delete()
        .eq('id', otpRequest.id);
      
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Delete the OTP after successful verification
    await supabase
      .from('otp_requests')
      .delete()
      .eq('id', otpRequest.id);

    // Generate a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { 
        personal_email, 
        purpose: 'password_reset',
        type: 'reset_token'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      message: 'OTP verified successfully',
      reset_token: resetToken,
      expires_in: '15 minutes'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;

    if (!reset_token || !new_password) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password_reset' || decoded.type !== 'reset_token') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const { personal_email } = decoded;

    console.log('Attempting to reset password for email:', personal_email);

    // Hash new password
    const passwordHash = await bcrypt.hash(new_password, 10);

    // Find and update user
    let updated = false;

    // Try to update in students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .update({ password_hash: passwordHash })
      .eq('personal_email', personal_email)
      .select('id')
      .single();

    if (student && !studentError) {
      updated = true;
      console.log('Student password updated successfully');
    } else if (studentError && studentError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected if user is not in students table
      console.error('Error updating student password:', studentError);
    } else if (studentError && studentError.code === 'PGRST116') {
      console.log('No student found with personal_email:', personal_email);
    }

    if (!updated) {
      // Try to update in teachers table
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .update({ password_hash: passwordHash })
        .eq('personal_email', personal_email)
        .select('id')
        .single();

      if (teacher && !teacherError) {
        updated = true;
        console.log('Teacher password updated successfully');
      } else if (teacherError && teacherError.code !== 'PGRST116') {
        console.error('Error updating teacher password:', teacherError);
      } else if (teacherError && teacherError.code === 'PGRST116') {
        console.log('No teacher found with personal_email:', personal_email);
      }
    }

    if (!updated) {
      // Try to update in admins table (admins use 'email' not 'personal_email')
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .update({ password_hash: passwordHash })
        .eq('email', personal_email)
        .select('id')
        .single();

      if (admin && !adminError) {
        updated = true;
        console.log('Admin password updated successfully');
      } else if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error updating admin password:', adminError);
      } else if (adminError && adminError.code === 'PGRST116') {
        console.log('No admin found with email:', personal_email);
      }
    }

    if (!updated) {
      console.log('No user found with email:', personal_email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Password successfully updated for email:', personal_email);
    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
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