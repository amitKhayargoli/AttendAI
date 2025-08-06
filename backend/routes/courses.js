const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all courses with related data
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teacher_courses:teacher_courses(
          teacher:teachers(id, name, email)
        )
      `)
      .eq('college_id', req.user.college_id)
      .order('name');

    if (error) throw error;

    res.json({ courses: data });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get courses for a specific teacher
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const { data, error } = await supabase
      .from('teacher_courses')
      .select(`
        course:courses(
          *,
          subjects:subjects(id, name, code, level)
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('course.college_id', req.user.college_id);

    if (error) throw error;

    const courses = data.map(item => item.course);
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ error: 'Failed to fetch teacher courses' });
  }
});

// Get courses for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const { data, error } = await supabase
      .from('student_courses')
      .select(`
        course:courses(
          *,
          subjects:subjects(id, name, code, level)
        )
      `)
      .eq('student_id', studentId)
      .eq('course.college_id', req.user.college_id);

    if (error) throw error;

    const courses = data.map(item => item.course);
    res.json({ courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Failed to fetch student courses' });
  }
});

// Create new course
router.post('/create', auth, async (req, res) => {
  try {
    const { name, code, description, duration_years } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const courseData = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || null,
      duration_years: duration_years || 4,
      college_id: req.user.college_id
    };

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Course created successfully',
      course: data 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Assign teacher to course
router.post('/:courseId/assign-teacher', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }

    // Verify course exists and belongs to college
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('college_id', req.user.college_id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify teacher exists and belongs to college
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', teacherId)
      .eq('college_id', req.user.college_id)
      .single();

    if (teacherError || !teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { data, error } = await supabase
      .from('teacher_courses')
      .insert([{
        teacher_id: teacherId,
        course_id: courseId
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Teacher assigned to course successfully',
      assignment: data 
    });
  } catch (error) {
    console.error('Error assigning teacher to course:', error);
    res.status(500).json({ error: 'Failed to assign teacher to course' });
  }
});

// Remove teacher from course
router.delete('/:courseId/remove-teacher/:teacherId', auth, async (req, res) => {
  try {
    const { courseId, teacherId } = req.params;

    const { error } = await supabase
      .from('teacher_courses')
      .delete()
      .eq('course_id', courseId)
      .eq('teacher_id', teacherId);

    if (error) throw error;

    res.json({ message: 'Teacher removed from course successfully' });
  } catch (error) {
    console.error('Error removing teacher from course:', error);
    res.status(500).json({ error: 'Failed to remove teacher from course' });
  }
});

// Enroll student in course
router.post('/:courseId/enroll-student', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Verify course exists and belongs to college
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('college_id', req.user.college_id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify student exists and belongs to college
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('college_id', req.user.college_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { data, error } = await supabase
      .from('student_courses')
      .insert([{
        student_id: studentId,
        course_id: courseId
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Student enrolled in course successfully',
      enrollment: data 
    });
  } catch (error) {
    console.error('Error enrolling student in course:', error);
    res.status(500).json({ error: 'Failed to enroll student in course' });
  }
});

// Remove student from course
router.delete('/:courseId/remove-student/:studentId', auth, async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const { error } = await supabase
      .from('student_courses')
      .delete()
      .eq('course_id', courseId)
      .eq('student_id', studentId);

    if (error) throw error;

    res.json({ message: 'Student removed from course successfully' });
  } catch (error) {
    console.error('Error removing student from course:', error);
    res.status(500).json({ error: 'Failed to remove student from course' });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, duration_years } = req.body;

    const updateData = {
      name: name?.trim(),
      code: code?.trim().toUpperCase(),
      description: description?.trim() || null,
      duration_years: duration_years || 4
    };

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .eq('college_id', req.user.college_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Course updated successfully',
      course: data 
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('college_id', req.user.college_id);

    if (error) throw error;

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router; 