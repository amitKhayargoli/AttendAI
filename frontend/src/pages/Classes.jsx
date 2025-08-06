import React, { useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { Search, BookOpen, User, Calendar, Clock, MapPin, Filter, Edit, Trash2, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react'

const Classes = () => {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    teacher_id: '',
    schedule_day: '',
    start_time: '',
    end_time: '',
    room_number: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState('All Days')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [editingClass, setEditingClass] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Class name must be at least 2 characters'
    }
    
    if (!formData.subject_id) {
      newErrors.subject_id = 'Please select a subject'
    }
    
    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Please select a teacher'
    }
    
    if (!formData.schedule_day) {
      newErrors.schedule_day = 'Please select a schedule day'
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required'
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required'
    }
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      if (start >= end) {
        newErrors.end_time = 'End time must be after start time'
      }
    }
    
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterClass = async () => {
    if (validateForm()) {
      try {
        const classData = {
          name: formData.name.trim(),
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          schedule_day: formData.schedule_day,
          start_time: formData.start_time,
          end_time: formData.end_time,
          room_number: formData.room_number.trim()
        }

        const result = await createClass(classData)
        
        // Refresh classes list
        await fetchClasses()
        
        // Reset form
        setFormData({
          name: '',
          subject_id: '',
          teacher_id: '',
          schedule_day: '',
          start_time: '',
          end_time: '',
          room_number: ''
        })
        
        setErrors({})
        showToast('Class created successfully!', 'success')
      } catch (error) {
        showToast(error.message || 'Failed to create class', 'error')
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error')
    }
  }

  const handleDeleteClass = (classId, className) => {
    if (window.confirm(`Are you sure you want to delete ${className}?`)) {
      deleteClass(classId)
    }
  }

  const handleEditClass = (classItem) => {
    setEditingClass({
      id: classItem.id,
      name: classItem.name,
      subject_id: classItem.subject_id || '',
      teacher_id: classItem.teacher_id || '',
      schedule_day: classItem.schedule_day,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      room_number: classItem.room_number
    })
    setShowEditModal(true)
  }

  const handleUpdateClass = async () => {
    if (!editingClass) return

    // Validate edit form
    const newErrors = {}
    if (!editingClass.name.trim()) {
      newErrors.name = 'Class name is required'
    }
    if (!editingClass.subject_id) {
      newErrors.subject_id = 'Please select a subject'
    }
    if (!editingClass.teacher_id) {
      newErrors.teacher_id = 'Please select a teacher'
    }
    if (!editingClass.schedule_day) {
      newErrors.schedule_day = 'Please select a schedule day'
    }
    if (!editingClass.start_time) {
      newErrors.start_time = 'Start time is required'
    }
    if (!editingClass.end_time) {
      newErrors.end_time = 'End time is required'
    }
    if (editingClass.start_time && editingClass.end_time) {
      const start = new Date(`2000-01-01T${editingClass.start_time}`)
      const end = new Date(`2000-01-01T${editingClass.end_time}`)
      if (start >= end) {
        newErrors.end_time = 'End time must be after start time'
      }
    }
    if (!editingClass.room_number.trim()) {
      newErrors.room_number = 'Room number is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: editingClass.name.trim(),
        subject_id: editingClass.subject_id,
        teacher_id: editingClass.teacher_id,
        schedule_day: editingClass.schedule_day,
        start_time: editingClass.start_time,
        end_time: editingClass.end_time,
        room_number: editingClass.room_number.trim()
      }
      
      const response = await fetch(`${API_BASE_URL}/class/${editingClass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update class')
      }

      // Refresh classes list
      await fetchClasses()
      
      // Close modal and reset
      setShowEditModal(false)
      setEditingClass(null)
      setErrors({})
      showToast('Class updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating class:', error)
      showToast(error.message || 'Failed to update class', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingClass(null)
    setErrors({})
  }

  const deleteClass = async (classId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete class')
      }

      // Refresh classes list after successful deletion
      await fetchClasses()
      showToast('Class deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting class:', error)
      showToast(error.message || 'Failed to delete class', 'error')
    } finally {
      setLoading(false)
    }
  }

  // API Functions
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/class`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch classes')
      }

      const data = await response.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
      showToast('Failed to fetch classes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/subject`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subjects')
      }

      const data = await response.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/teacher`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch teachers')
      }

      const data = await response.json()
      setTeachers(data.teachers || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const createClass = async (classData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/class/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create class')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating class:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load classes, subjects and teachers on component mount
  React.useEffect(() => {
    fetchClasses()
    fetchSubjects()
    fetchTeachers()
  }, [])

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredByDay = selectedDay === 'All Days' 
    ? filteredClasses 
    : filteredClasses.filter(classItem => classItem.schedule_day === selectedDay)

  return (
    <div className="min-h-screen flex"
     style={{ background: "#f8f9fa" }}>
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Add New Class */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Class</h2>
              
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
                        handleInputChange('name', e.target.value)
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: '' }))
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
                        handleInputChange('subject_id', e.target.value)
                        if (errors.subject_id) {
                          setErrors(prev => ({ ...prev, subject_id: '' }))
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
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  {errors.subject_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                  )}
                </div>

                {/* Assigned Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Teacher</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => {
                        handleInputChange('teacher_id', e.target.value)
                        if (errors.teacher_id) {
                          setErrors(prev => ({ ...prev, teacher_id: '' }))
                        }
                      }}
                      className={`pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none ${
                        errors.teacher_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  {errors.teacher_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.teacher_id}</p>
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
                        handleInputChange('schedule_day', e.target.value)
                        if (errors.schedule_day) {
                          setErrors(prev => ({ ...prev, schedule_day: '' }))
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
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
                          handleInputChange('start_time', e.target.value)
                          if (errors.start_time) {
                            setErrors(prev => ({ ...prev, start_time: '' }))
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
                          handleInputChange('end_time', e.target.value)
                          if (errors.end_time) {
                            setErrors(prev => ({ ...prev, end_time: '' }))
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
                        handleInputChange('room_number', e.target.value)
                        if (errors.room_number) {
                          setErrors(prev => ({ ...prev, room_number: '' }))
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

                {/* Create Class Button */}
                <button
                  onClick={handleRegisterClass}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Creating Class...' : 'Create Class'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-2/3 space-y-6">
            {/* Classes List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes List</h2>
                
                {/* Filter Controls */}
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none"
                    >
                      <option value="All Days">All Days</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading classes...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredByDay.map((classItem) => (
                        <tr key={classItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {classItem.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classItem.subject_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classItem.teacher_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              classItem.schedule_day === 'Monday' ? 'bg-blue-100 text-blue-800' :
                              classItem.schedule_day === 'Tuesday' ? 'bg-green-100 text-green-800' :
                              classItem.schedule_day === 'Wednesday' ? 'bg-yellow-100 text-yellow-800' :
                              classItem.schedule_day === 'Thursday' ? 'bg-purple-100 text-purple-800' :
                              classItem.schedule_day === 'Friday' ? 'bg-pink-100 text-pink-800' :
                              classItem.schedule_day === 'Saturday' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {classItem.schedule_day}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classItem.start_time} - {classItem.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classItem.room_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditClass(classItem)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing 1 to {filteredByDay.length} of {filteredByDay.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-[#9886FE] text-white rounded text-sm">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Class</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={editingClass.subject_id}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, subject_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none ${
                      errors.subject_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  {errors.subject_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                  )}
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Teacher</label>
                  <select
                    value={editingClass.teacher_id}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, teacher_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none ${
                      errors.teacher_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                  {errors.teacher_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.teacher_id}</p>
                  )}
                </div>

                {/* Schedule Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Day</label>
                  <select
                    value={editingClass.schedule_day}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, schedule_day: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none ${
                      errors.schedule_day ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  {errors.schedule_day && (
                    <p className="mt-1 text-sm text-red-600">{errors.schedule_day}</p>
                  )}
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editingClass.start_time}
                      onChange={(e) => setEditingClass(prev => ({ ...prev, start_time: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                        errors.start_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.start_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editingClass.end_time}
                      onChange={(e) => setEditingClass(prev => ({ ...prev, end_time: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                        errors.end_time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.end_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                    )}
                  </div>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={editingClass.room_number}
                    onChange={(e) => setEditingClass(prev => ({ ...prev, room_number: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.room_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.room_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.room_number}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateClass}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${
                      loading 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-[#9886FE] hover:bg-[#7c6cf8]'
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Class'}
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
    </div>
  )
}

export default Classes