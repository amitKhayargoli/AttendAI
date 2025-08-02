const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateToken = require('../middleware/auth');

// Mark attendance
router.post('/mark', authenticateToken, async (req, res) => {
  try {
    const { classId, date, status } = req.body;
    const studentEmail = req.user.email;

    // Validate required fields
    if (!classId || !date || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: classId, date, status' 
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

    // Check if attendance already exists for this student, class, and date
    const { data: existingAttendance, error: checkError } = await supabase
      .from('class_attendance')
      .select('id, status')
      .eq('student_id', student.id)
      .eq('class_id', classId)
      .eq('date', date)
      .single();

    if (existingAttendance) {
      return res.status(409).json({ 
        error: 'Attendance already marked for this class and date' 
      });
    }

    // Record attendance
    const { data: attendance, error: insertError } = await supabase
      .from('class_attendance')
      .insert({
        student_id: student.id,
        class_id: classId,
        date: date,
        status: status
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error recording attendance:', insertError);
      return res.status(500).json({ error: 'Failed to record attendance' });
    }

    res.json({ 
      message: 'Attendance recorded successfully',
      attendance: attendance
    });

  } catch (error) {
    console.error('Error in POST /attendance/mark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's attendance history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const studentEmail = req.user.email;

    // Get student's details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('email', studentEmail)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get attendance history with class and subject details
    const { data: attendanceHistory, error: historyError } = await supabase
      .from('class_attendance')
      .select(`
        id,
        date,
        status,
        created_at,
        class:classes(
          id,
          name,
          schedule_day,
          start_time,
          end_time,
          room_number,
          subject:subjects(
            id,
            name,
            code
          )
        )
      `)
      .eq('student_id', student.id)
      .order('date', { ascending: false });

    if (historyError) {
      console.error('Error fetching attendance history:', historyError);
      return res.status(500).json({ error: 'Failed to fetch attendance history' });
    }

    res.json({ 
      attendanceHistory: attendanceHistory
    });

  } catch (error) {
    console.error('Error in GET /attendance/history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 