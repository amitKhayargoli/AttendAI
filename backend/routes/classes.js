const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateToken = require('../middleware/auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET all classes with subject and teacher details
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get college_id based on user type
    let college_id;
    const userEmail = req.user.email;
    const userType = req.user.userType;

    if (userType === 'admin') {
      const { data: admin } = await supabase
        .from('admins')
        .select('college_id')
        .eq('email', userEmail)
        .single();

      if (!admin) {
        return res.status(403).json({ error: 'Admin not found' });
      }
      college_id = admin.college_id;
    } else if (userType === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('college_id')
        .eq('email', userEmail)
        .single();

      if (!teacher) {
        return res.status(403).json({ error: 'Teacher not found' });
      }
      college_id = teacher.college_id;
    } else {
      return res.status(403).json({ error: 'Unauthorized user type' });
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .eq('college_id', college_id) // Filter by college
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching classes:', error);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }

    // Transform data to include subject_name and teacher_name
    const transformedClasses = classes.map(classItem => ({
      id: classItem.id,
      name: classItem.name,
      subject_id: classItem.subject_id,
      subject_name: classItem.subjects?.name || 'No Subject',
      teacher_id: classItem.teacher_id,
      teacher_name: classItem.teachers?.name || 'No Teacher',
      schedule_day: classItem.schedule_day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      room_number: classItem.room_number,
      college_id: classItem.college_id,
      created_at: classItem.created_at
    }));

    res.json({ classes: transformedClasses });
  } catch (error) {
    console.error('Error in GET /classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single class by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: classItem, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching class:', error);
      return res.status(404).json({ error: 'Class not found' });
    }

    const transformedClass = {
      id: classItem.id,
      name: classItem.name,
      subject_id: classItem.subject_id,
      subject_name: classItem.subjects?.name || 'No Subject',
      teacher_id: classItem.teacher_id,
      teacher_name: classItem.teachers?.name || 'No Teacher',
      schedule_day: classItem.schedule_day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      room_number: classItem.room_number,
      college_id: classItem.college_id,
      created_at: classItem.created_at
    };

    res.json({ class: transformedClass });
  } catch (error) {
    console.error('Error in GET /classes/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new class
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      subject_id,
      teacher_id,
      schedule_day,
      start_time,
      end_time,
      room_number
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    if (!subject_id) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    if (!teacher_id) {
      return res.status(400).json({ error: 'Teacher is required' });
    }

    if (!schedule_day) {
      return res.status(400).json({ error: 'Schedule day is required' });
    }

    if (!start_time) {
      return res.status(400).json({ error: 'Start time is required' });
    }

    if (!end_time) {
      return res.status(400).json({ error: 'End time is required' });
    }

    if (!room_number || !room_number.trim()) {
      return res.status(400).json({ error: 'Room number is required' });
    }

    // Validate schedule day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(schedule_day)) {
      return res.status(400).json({ error: 'Invalid schedule day' });
    }

    // Validate time format and logic
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    // Check if end time is after start time
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Get college_id based on user type (admin or teacher)
    let college_id;
    const userEmail = req.user.email;
    const userType = req.user.userType;

    if (userType === 'admin') {
      // For admin, get college_id from admin table
      const { data: admin } = await supabase
        .from('admins')
        .select('college_id')
        .eq('email', userEmail)
        .single();

      if (!admin) {
        return res.status(403).json({ error: 'Admin not found' });
      }
      college_id = admin.college_id;
    } else if (userType === 'teacher') {
      // For teacher, get college_id from teacher table
      const { data: teacher } = await supabase
        .from('teachers')
        .select('college_id')
        .eq('email', userEmail)
        .single();

      if (!teacher) {
        return res.status(403).json({ error: 'Teacher not found' });
      }
      college_id = teacher.college_id;
    } else {
      return res.status(403).json({ error: 'Unauthorized user type' });
    }

    // Check if subject exists and belongs to the same college
    const { data: subject } = await supabase
      .from('subjects')
      .select('id, college_id')
      .eq('id', subject_id)
      .single();

    if (!subject) {
      return res.status(400).json({ error: 'Subject not found' });
    }

    if (subject.college_id !== college_id) {
      return res.status(403).json({ error: 'Access denied to this subject' });
    }

    // Check if teacher exists and belongs to the same college
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, college_id')
      .eq('id', teacher_id)
      .single();

    if (!teacher) {
      return res.status(400).json({ error: 'Teacher not found' });
    }

    if (teacher.college_id !== college_id) {
      return res.status(403).json({ error: 'Access denied to this teacher' });
    }

    // For teachers, ensure they can only create classes for themselves
    if (userType === 'teacher') {
      const { data: currentTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (currentTeacher.id !== teacher_id) {
        return res.status(403).json({ error: 'Teachers can only create classes for themselves' });
      }
    }

    // Remove or comment out this entire block
    /*
    const { data: conflictingClasses } = await supabase
      .from('classes')
      .select('id, name, start_time, end_time, schedule_day')
      .eq('schedule_day', schedule_day)
      .eq('teacher_id', teacher_id)
      .or(`start_time.lte.${start_time},end_time.gte.${start_time},start_time.lte.${end_time},end_time.gte.${end_time}`);

    if (conflictingClasses && conflictingClasses.length > 0) {
      return res.status(400).json({ 
        error: 'Time conflict detected. Teacher has another class at this time.' 
      });
    }
    */

    // Create the class
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        name: name.trim(),
        subject_id,
        teacher_id,
        schedule_day,
        start_time,
        end_time,
        room_number: room_number.trim(),
        college_id: college_id
      })
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .single();

    if (createError) {
      console.error('Error creating class:', createError);
      return res.status(500).json({ error: 'Failed to create class' });
    }

    const transformedClass = {
      id: newClass.id,
      name: newClass.name,
      subject_id: newClass.subject_id,
      subject_name: newClass.subjects?.name || 'No Subject',
      teacher_id: newClass.teacher_id,
      teacher_name: newClass.teachers?.name || 'No Teacher',
      schedule_day: newClass.schedule_day,
      start_time: newClass.start_time,
      end_time: newClass.end_time,
      room_number: newClass.room_number,
      college_id: newClass.college_id,
      created_at: newClass.created_at
    };

    res.status(201).json({ 
      message: 'Class created successfully',
      class: transformedClass 
    });
  } catch (error) {
    console.error('Error in POST /classes/create:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update class
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject_id,
      teacher_id,
      schedule_day,
      start_time,
      end_time,
      room_number
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    if (!subject_id) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    if (!teacher_id) {
      return res.status(400).json({ error: 'Teacher is required' });
    }

    if (!schedule_day) {
      return res.status(400).json({ error: 'Schedule day is required' });
    }

    if (!start_time) {
      return res.status(400).json({ error: 'Start time is required' });
    }

    if (!end_time) {
      return res.status(400).json({ error: 'End time is required' });
    }

    if (!room_number || !room_number.trim()) {
      return res.status(400).json({ error: 'Room number is required' });
    }

    // Validate schedule day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(schedule_day)) {
      return res.status(400).json({ error: 'Invalid schedule day' });
    }

    // Validate time format and logic
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    // Check if end time is after start time
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Get admin's college_id from token
    const adminEmail = req.user.email;
    const { data: admin } = await supabase
      .from('admins')
      .select('college_id')
      .eq('email', adminEmail)
      .single();

    if (!admin) {
      return res.status(403).json({ error: 'Admin not found' });
    }

    // Check if class exists and belongs to admin's college
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id, college_id')
      .eq('id', id)
      .single();

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (existingClass.college_id !== admin.college_id) {
      return res.status(403).json({ error: 'Access denied to this class' });
    }

    // Check if subject exists and belongs to admin's college
    const { data: subject } = await supabase
      .from('subjects')
      .select('id, college_id')
      .eq('id', subject_id)
      .single();

    if (!subject) {
      return res.status(400).json({ error: 'Subject not found' });
    }

    if (subject.college_id !== admin.college_id) {
      return res.status(403).json({ error: 'Access denied to this subject' });
    }

    // Check if teacher exists and belongs to admin's college
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, college_id')
      .eq('id', teacher_id)
      .single();

    if (!teacher) {
      return res.status(400).json({ error: 'Teacher not found' });
    }

    if (teacher.college_id !== admin.college_id) {
      return res.status(403).json({ error: 'Access denied to this teacher' });
    }

    // Check for time conflicts (excluding current class)
    const { data: conflictingClasses } = await supabase
      .from('classes')
      .select('id, name, start_time, end_time, schedule_day')
      .eq('schedule_day', schedule_day)
      .eq('teacher_id', teacher_id)
      .neq('id', id)
      .or(`start_time.lte.${start_time},end_time.gte.${start_time},start_time.lte.${end_time},end_time.gte.${end_time}`);

    if (conflictingClasses && conflictingClasses.length > 0) {
      return res.status(400).json({ 
        error: 'Time conflict detected. Teacher has another class at this time.' 
      });
    }

    // Update the class
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update({
        name: name.trim(),
        subject_id,
        teacher_id,
        schedule_day,
        start_time,
        end_time,
        room_number: room_number.trim()
      })
      .eq('id', id)
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating class:', updateError);
      return res.status(500).json({ error: 'Failed to update class' });
    }

    const transformedClass = {
      id: updatedClass.id,
      name: updatedClass.name,
      subject_id: updatedClass.subject_id,
      subject_name: updatedClass.subjects?.name || 'No Subject',
      teacher_id: updatedClass.teacher_id,
      teacher_name: updatedClass.teachers?.name || 'No Teacher',
      schedule_day: updatedClass.schedule_day,
      start_time: updatedClass.start_time,
      end_time: updatedClass.end_time,
      room_number: updatedClass.room_number,
      college_id: updatedClass.college_id,
      created_at: updatedClass.created_at
    };

    res.json({ 
      message: 'Class updated successfully',
      class: transformedClass 
    });
  } catch (error) {
    console.error('Error in PUT /classes/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE class
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get admin's college_id from token
    const adminEmail = req.user.email;
    const { data: admin } = await supabase
      .from('admins')
      .select('college_id')
      .eq('email', adminEmail)
      .single();

    if (!admin) {
      return res.status(403).json({ error: 'Admin not found' });
    }

    // Check if class exists and belongs to admin's college
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id, college_id, name')
      .eq('id', id)
      .single();

    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (existingClass.college_id !== admin.college_id) {
      return res.status(403).json({ error: 'Access denied to this class' });
    }

    // Delete the class
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting class:', deleteError);
      return res.status(500).json({ error: 'Failed to delete class' });
    }

    res.json({ 
      message: 'Class deleted successfully',
      deletedClass: { id, name: existingClass.name }
    });
  } catch (error) {
    console.error('Error in DELETE /classes/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET classes by teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .eq('teacher_id', teacherId)
      .order('schedule_day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching classes by teacher:', error);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }

    const transformedClasses = classes.map(classItem => ({
      id: classItem.id,
      name: classItem.name,
      subject_id: classItem.subject_id,
      subject_name: classItem.subjects?.name || 'No Subject',
      teacher_id: classItem.teacher_id,
      teacher_name: classItem.teachers?.name || 'No Teacher',
      schedule_day: classItem.schedule_day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      room_number: classItem.room_number,
      college_id: classItem.college_id,
      created_at: classItem.created_at
    }));

    res.json({ classes: transformedClasses });
  } catch (error) {
    console.error('Error in GET /classes/teacher/:teacherId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET classes for student (based on student's enrolled subjects)
router.get('/student/classes', authenticateToken, async (req, res) => {
  try {
    const studentEmail = req.user.email;

    // Get student's details and enrolled subjects
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, college_id')
      .eq('email', studentEmail)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get student's enrolled subjects
    const { data: enrolledSubjects, error: subjectsError } = await supabase
      .from('student_subjects')
      .select('subject_id')
      .eq('student_id', student.id);

    if (subjectsError) {
      console.error('Error fetching student subjects:', subjectsError);
      return res.status(500).json({ error: 'Failed to fetch student subjects' });
    }

    const subjectIds = enrolledSubjects.map(es => es.subject_id);

    if (subjectIds.length === 0) {
      return res.json({ classes: [] });
    }

    // Get classes for the student's enrolled subjects
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name, code),
        teachers:teacher_id(name, email)
      `)
      .in('subject_id', subjectIds)
      .eq('college_id', student.college_id)
      .order('schedule_day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching student classes:', error);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }

    // Transform classes and add attendance status
    const transformedClasses = classes.map(classItem => {
      // Determine if class is active based on current time and schedule
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      let status = 'upcoming';
      let canMarkAttendance = false;
      
      if (classItem.schedule_day === currentDay) {
        if (currentTime >= classItem.start_time && currentTime <= classItem.end_time) {
          status = 'active';
          canMarkAttendance = true;
        } else if (currentTime < classItem.start_time) {
          status = 'upcoming';
          canMarkAttendance = false;
        } else {
          status = 'recorded';
          canMarkAttendance = false;
        }
      } else {
        status = 'upcoming';
        canMarkAttendance = false;
      }

      return {
        id: classItem.id,
        title: classItem.name,
        description: classItem.subjects?.name || 'No Subject',
        teacher: classItem.teachers?.name || 'No Teacher',
        schedule: `${classItem.schedule_day}, ${classItem.start_time} - ${classItem.end_time}`,
        room: classItem.room_number,
        status,
        canMarkAttendance,
        lastUpdated: new Date(classItem.created_at).toLocaleDateString(),
        // Additional fields for better display
        subjectName: classItem.subjects?.name || 'No Subject',
        subjectCode: classItem.subjects?.code || '',
        teacherName: classItem.teachers?.name || 'No Teacher',
        teacherEmail: classItem.teachers?.email || '',
        scheduleDay: classItem.schedule_day,
        startTime: classItem.start_time,
        endTime: classItem.end_time,
        roomNumber: classItem.room_number
      };
    });

    res.json({ classes: transformedClasses });
  } catch (error) {
    console.error('Error in GET /classes/student/classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET classes by subject
router.get('/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
      .eq('subject_id', subjectId)
      .order('schedule_day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching classes by subject:', error);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }

    const transformedClasses = classes.map(classItem => ({
      id: classItem.id,
      name: classItem.name,
      subject_id: classItem.subject_id,
      subject_name: classItem.subjects?.name || 'No Subject',
      teacher_id: classItem.teacher_id,
      teacher_name: classItem.teachers?.name || 'No Teacher',
      schedule_day: classItem.schedule_day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      room_number: classItem.room_number,
      college_id: classItem.college_id,
      created_at: classItem.created_at
    }));

    res.json({ classes: transformedClasses });
  } catch (error) {
    console.error('Error in GET /classes/subject/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher profile (for logged-in teacher)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const teacherEmail = req.user.email;

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('id, name, email, personal_email, contact, joined_at, created_at')
      .eq('email', teacherEmail)
      .single();

    if (error || !teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ teacher });

  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
