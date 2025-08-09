import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import TeacherNavbar from "@/components/TeacherNavbar";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus,
  MapPin,
  BookOpen,
  User,
  Clock,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Custom Filter Icon Component
const CustomFilterIcon = ({ className = "h-4 w-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 16 16" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M-0.5 0C-0.5 0.27614 -0.27614 0.5 0 0.5L14 0.5C14.2761 0.5 14.5 0.27614 14.5 0C14.5 -0.27614 14.2761 -0.5 14 -0.5L0 -0.5C-0.27614 -0.5 -0.5 -0.27614 -0.5 0ZM2 3.5C2 3.77614 2.22386 4 2.5 4L11.5 4C11.7761 4 12 3.77614 12 3.5C12 3.22386 11.7761 3 11.5 3L2.5 3C2.22386 3 2 3.22386 2 3.5ZM5 7C5 7.27614 5.22386 7.5 5.5 7.5L8.5 7.5C8.77614 7.5 9 7.27614 9 7C9 6.72386 8.77614 6.5 8.5 6.5L5.5 6.5C5.22386 6.5 5 6.72386 5 7Z" 
      fillRule="evenodd" 
      transform="matrix(1 0 0 1 1 4.5)"
    />
  </svg>
);

const ClassTimeline = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allClasses, setAllClasses] = useState([]); // Store all classes
  const [classes, setClasses] = useState([]); // Filtered classes for selected date
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add Class Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  // Update the formData state to auto-fill teacher_id
  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    schedule_day: '',
    start_time: '',
    end_time: '',
    room_number: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize currentTime with current date
  const [currentTime, setCurrentTime] = useState(new Date());

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Function to get day name from date
  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Function to filter classes by selected date
  const filterClassesByDate = (selectedDate, allClasses) => {
    const selectedDayName = getDayName(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate));
    
    return allClasses.filter(cls => cls.scheduleDay === selectedDayName);
  };

  // Update classes when selectedDate or allClasses changes
  useEffect(() => {
    const filteredClasses = filterClassesByDate(selectedDate, allClasses);
    setClasses(filteredClasses);
  }, [selectedDate, allClasses, currentMonth]); // Removed currentTime dependency

  // Fetch classes from backend - only for teacher's assigned subjects
  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Get teacher's assigned subjects first
      const teacherSubjectsResponse = await fetch('http://localhost:5000/api/teacher/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!teacherSubjectsResponse.ok) {
        throw new Error('Failed to fetch teacher subjects');
      }
      
      const teacherSubjectsData = await teacherSubjectsResponse.json();
      const teacherSubjectIds = teacherSubjectsData.subjects.map(subject => subject.id);
      
      if (teacherSubjectIds.length === 0) {
        setAllClasses([]);
        setLoading(false);
        return;
      }
      
      // Fetch classes for teacher's assigned subjects
      const response = await fetch('http://localhost:5000/api/class', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      
      // Filter classes to only include those for teacher's assigned subjects
      const filteredClasses = data.classes.filter(cls => 
        teacherSubjectIds.includes(cls.subject_id)
      );
      
      // Transform the data to match our component's expected format
      const transformedClasses = filteredClasses.map(cls => ({
        id: cls.id,
        title: cls.name,
        type: cls.room_number,
        startTime: cls.start_time,
        endTime: cls.end_time,
        duration: calculateDuration(cls.start_time, cls.end_time),
        scheduleDay: cls.schedule_day,
        subject: cls.subject_name || 'Mathematics',
        isActive: false
      }));
      
      setAllClasses(transformedClasses); // Store all classes
    } catch (err) {
      setError(err.message);
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end - start) / (1000 * 60));
  };

  // Convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
    return calendarDays;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const getClassPosition = (startTime) => {
    const hour = parseInt(startTime.split(':')[0]);
    const minute = parseInt(startTime.split(':')[1]);
    const isPM = startTime.includes('PM') && hour !== 12;
    const adjustedHour = isPM ? hour + 12 : hour;
    return (adjustedHour - 8) * 96 + minute; // 8 AM is base, updated spacing to 96px per hour to match h-24
  };

  // Function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let adjustedHour = hour;
    
    if (period === 'PM' && hour !== 12) {
      adjustedHour = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      adjustedHour = 0;
    }
    
    return adjustedHour * 60 + minute;
  };

  // Function to check if a class is currently active (matches system time)
  const isClassCurrentlyActive = (cls) => {
    const now = new Date(); // Always use current time
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeString = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Check if it's the same day and time
    if (cls.scheduleDay === currentDay) {
      const startTime = cls.startTime;
      const endTime = cls.endTime;
      
      // Check if current time is between start and end time
      if (currentTimeString >= startTime && currentTimeString <= endTime) {
        return true;
      }
    }
    
    return false;
  };

  // Function to get class status
  const getClassStatus = (cls) => {
    const now = new Date(); // Always use current time
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTimeString = now.toTimeString().slice(0, 5); // HH:MM format
    
    if (cls.scheduleDay === currentDay) {
      if (currentTimeString >= cls.startTime && currentTimeString <= cls.endTime) {
        return 'active';
      } else if (currentTimeString < cls.startTime) {
        return 'upcoming';
      } else {
        return 'completed';
      }
    } else {
      return 'upcoming';
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'completed':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  // Function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Currently Active';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  // Function to update active class based on current time
  const updateActiveClass = () => {
    setClasses(prevClasses => 
      prevClasses.map(cls => ({
        ...cls,
        isActive: isClassCurrentlyActive(cls)
      }))
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Class name must be at least 2 characters';
    }
    
    if (!formData.subject_id) {
      newErrors.subject_id = 'Please select a subject';
    }
    
    // Remove teacher validation since we're auto-filling it
    
    if (!formData.schedule_day) {
      newErrors.schedule_day = 'Please select a schedule day';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      if (start >= end) {
        newErrors.end_time = 'End time must be after start time';
      }
    }
    
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateClass = async () => {
    if (validateForm()) {
      try {
        // Get the current teacher's ID
        const teacherId = await getCurrentTeacherId();
        if (!teacherId) {
          showToast('Failed to get teacher information', 'error');
          return;
        }

        const classData = {
          name: formData.name.trim(),
          subject_id: formData.subject_id,
          teacher_id: teacherId, // Auto-fill with current teacher's ID
          schedule_day: formData.schedule_day,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room_number: formData.room_number.trim()
        };

        const result = await createClass(classData);
        
        // Refresh classes list
        await fetchClasses();
        
        // Reset form
        setFormData({
          name: '',
          subject_id: '',
          schedule_day: '',
          start_time: '',
          end_time: '',
          room_number: ''
        });
        
        setErrors({});
        setShowAddModal(false);
        showToast('Class created successfully!', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to create class', 'error');
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error');
    }
  };

  const createClass = async (classData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/class/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create class');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/subjects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Add a function to get the current teacher's ID
  const getCurrentTeacherId = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teacher profile');
      }

      const data = await response.json();
      return data.teacher.id;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  };

  // Update the useEffect to auto-fill teacher_id
  useEffect(() => {
    const initializeForm = async () => {
      // The teacher_id is now auto-filled in handleCreateClass
    };

    fetchClasses();
    fetchSubjects();
    initializeForm(); // No longer needed for teacher_id
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Update the calendar day click handler
  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <TeacherNavbar activePage="calendar" />

      <div className="flex">
        {/* Left Sidebar */}
        <div     className="w-80 bg-white border-r border-gray-200 p-6 h-screen fixed top-0 left-0 overflow-y-auto"
    style={{ height: 'calc(100vh - 70px)', paddingTop: '70px' }} >
          {/* Calendar Widget */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div key={index} className="text-center py-2">
                  {day && (
                    <button
                      onClick={() => handleDateClick(day)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        day === selectedDate
                          ? 'bg-[#7c6cf8] text-white'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

                     {/* Search Bar */}
           <div className="mb-6">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 placeholder="Search..."
                 className="pl-10 rounded-lg"
               />
             </div>
           </div>

                       {/* Filter Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start rounded-lg">
                <CustomFilterIcon className="h-4 w-4 mr-2" />
                Subject
              </Button>
              <Button variant="outline" className="justify-start rounded-lg">
                <CustomFilterIcon className="h-4 w-4 mr-2" />
                Class Type
              </Button>
              <Button variant="outline" className="justify-start rounded-lg">
                <CustomFilterIcon className="h-4 w-4 mr-2" />
                Room
              </Button>
            </div>
        </div>

        {/* Main Content Area */}
        {/* <div className="flex-1 p-6"> */}
        <div className="flex-1 ml-80 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 70px)' }}>
          {/* Header */}
                     <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-bold text-gray-900">
               {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { 
                 weekday: 'long', 
                 day: 'numeric',
                 month: 'long',
                 year: 'numeric'
               })}
             </h1>
                         <Button 
              className="!bg-[#7c6cf8] !hover:bg-[#6b5ce7] cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>

          {/* Current Time Display */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Current Time: {currentTime.toLocaleTimeString()}
              </span>
              <span className="text-sm text-blue-600">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="relative">
            {/* Time slots */}
            <div className="absolute left-0 top-0 w-20">
                             {timeSlots.map((time, index) => (
                                 <div key={index} className="flex items-center h-24 text-sm text-gray-600">
                   <div className="w-2 h-2 bg-[#7c6cf8] rounded-full mr-3"></div>
                   {time}
                 </div>
               ))}
            </div>

            {/* Timeline content */}
            <div className="ml-20 relative">
              {/* Timeline line */}

              
                                                                                                                       {/* Classes */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading classes...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Error: {error}</div>
                </div>
              ) : classes.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">No classes scheduled for {getDayName(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate))}</div>
                </div>
              ) : (
                classes.map((cls) => {
                  // Calculate active status on every render
                  const isActive = isClassCurrentlyActive(cls);
                  const status = getClassStatus(cls);
                  
                  return (
                    <div
                      key={cls.id}
                      className={`absolute left-8 right-4 rounded-lg border-l-4 p-3 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${
                        isActive 
                          ? 'bg-[rgba(251,191,36,0.2)] border-l-4' 
                          : 'bg-white border-l-4'
                      }`}
                      style={{
                        top: `${getClassPosition(formatTime(cls.startTime))}px`,
                        height: `${cls.duration + 20}px`,
                        borderLeftColor: isActive ? '#FBBF24' : '#9886FE'
                      }}
                      onClick={() => navigate('/attendance-session', { 
                        state: { 
                          classDetails: {
                            id: cls.id,
                            name: cls.title,
                            startTime: cls.startTime,
                            endTime: cls.endTime,
                            roomNumber: cls.type,
                            subject: cls.subject,
                            scheduleDay: cls.scheduleDay
                          }
                        }
                      })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {cls.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{cls.title}</p>
                          
                          {/* Status Badge */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {isActive && (
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></div>
                              )}
                              {getStatusText(status)}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 ml-2">
                          <span className="text-lg">⋯</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Class</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: '',
                    subject_id: '',
                    schedule_day: '',
                    start_time: '',
                    end_time: '',
                    room_number: ''
                  });
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Enter class name"
                    value={formData.name}
                    onChange={(e) => {
                      handleInputChange('name', e.target.value);
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.subject_id}
                    onChange={(e) => {
                      handleInputChange('subject_id', e.target.value);
                      if (errors.subject_id) {
                        setErrors(prev => ({ ...prev, subject_id: '' }));
                      }
                    }}
                    className={`pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none ${
                      errors.subject_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                {errors.subject_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                )}
              </div>

              {/* Schedule Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Day</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.schedule_day}
                    onChange={(e) => {
                      handleInputChange('schedule_day', e.target.value);
                      if (errors.schedule_day) {
                        setErrors(prev => ({ ...prev, schedule_day: '' }));
                      }
                    }}
                    className={`pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none ${
                      errors.schedule_day ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                {errors.schedule_day && (
                  <p className="mt-1 text-sm text-red-600">{errors.schedule_day}</p>
                )}
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => {
                        handleInputChange('start_time', e.target.value);
                        if (errors.start_time) {
                          setErrors(prev => ({ ...prev, start_time: '' }));
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.start_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => {
                        handleInputChange('end_time', e.target.value);
                        if (errors.end_time) {
                          setErrors(prev => ({ ...prev, end_time: '' }));
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.end_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                  )}
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Enter room number"
                    value={formData.room_number}
                    onChange={(e) => {
                      handleInputChange('room_number', e.target.value);
                      if (errors.room_number) {
                        setErrors(prev => ({ ...prev, room_number: '' }));
                      }
                    }}
                    className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                      errors.room_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.room_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      name: '',
                      subject_id: '',
                      schedule_day: '',
                      start_time: '',
                      end_time: '',
                      room_number: ''
                    });
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  className="flex-1 px-4 py-2 bg-[#9886FE] text-white rounded-lg hover:bg-[#7c6cf8]"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTimeline;
