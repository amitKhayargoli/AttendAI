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
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        subjects:subject_id(name),
        teachers:teacher_id(name)
      `)
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

    // Check for time conflicts (optional - you can remove this if not needed)
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
        college_id: admin.college_id
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

module.exports = router;
