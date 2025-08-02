import React, { useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { Search, BookOpen, Hash, Clock, Filter, Edit, Trash2, ChevronDown, CheckCircle, AlertCircle, X, Users, GraduationCap, UserPlus, UserMinus } from 'lucide-react'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration_years: 4
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [editingCourse, setEditingCourse] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [assignType, setAssignType] = useState('teacher') // 'teacher' or 'student'

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
      newErrors.name = 'Course name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Course name must be at least 2 characters'
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required'
    } else if (!/^[A-Za-z0-9]{2,10}$/.test(formData.code.trim())) {
      newErrors.code = 'Course code must be 2-10 alphanumeric characters'
    }
    
    if (formData.duration_years < 1 || formData.duration_years > 6) {
      newErrors.duration_years = 'Duration must be between 1 and 6 years'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCourse = async () => {
    if (validateForm()) {
      try {
        const courseData = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          duration_years: parseInt(formData.duration_years)
        }

        const result = await createCourse(courseData)
        
        // Refresh courses list
        await fetchCourses()
        
        // Reset form
        setFormData({
          name: '',
          code: '',
          description: '',
          duration_years: 4
        })
        
        setErrors({})
        showToast('Course created successfully!', 'success')
      } catch (error) {
        showToast(error.message || 'Failed to create course', 'error')
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error')
    }
  }

  const handleDeleteCourse = (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete ${courseName}?`)) {
      deleteCourse(courseId)
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourse({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      duration_years: course.duration_years
    })
    setShowEditModal(true)
  }

  const handleAssignTeacher = (course) => {
    setSelectedCourse(course)
    setAssignType('teacher')
    setShowAssignModal(true)
  }

  const handleAssignStudent = (course) => {
    setSelectedCourse(course)
    setAssignType('student')
    setShowAssignModal(true)
  }

  const handleAssignUser = async (userId) => {
    if (!selectedCourse) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = assignType === 'teacher' 
        ? `${API_BASE_URL}/courses/${selectedCourse.id}/assign-teacher`
        : `${API_BASE_URL}/courses/${selectedCourse.id}/enroll-student`
      
      const bodyData = assignType === 'teacher' 
        ? { teacherId: userId }
        : { studentId: userId }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to assign ${assignType}`)
      }

      // Refresh courses list
      await fetchCourses()
      setShowAssignModal(false)
      setSelectedCourse(null)
      showToast(`${assignType === 'teacher' ? 'Teacher' : 'Student'} assigned successfully!`, 'success')
    } catch (error) {
      console.error(`Error assigning ${assignType}:`, error)
      showToast(error.message || `Failed to assign ${assignType}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (courseId, userId, userName, userType) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from this course?`)) {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const endpoint = userType === 'teacher'
          ? `${API_BASE_URL}/courses/${courseId}/remove-teacher/${userId}`
          : `${API_BASE_URL}/courses/${courseId}/remove-student/${userId}`

        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to remove ${userType}`)
        }

        // Refresh courses list
        await fetchCourses()
        showToast(`${userType === 'teacher' ? 'Teacher' : 'Student'} removed successfully!`, 'success')
      } catch (error) {
        console.error(`Error removing ${userType}:`, error)
        showToast(error.message || `Failed to remove ${userType}`, 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    // Validate edit form
    const newErrors = {}
    if (!editingCourse.name.trim()) {
      newErrors.name = 'Course name is required'
    }
    if (!editingCourse.code.trim()) {
      newErrors.code = 'Course code is required'
    } else if (!/^[A-Za-z0-9]{2,10}$/.test(editingCourse.code.trim())) {
      newErrors.code = 'Course code must be 2-10 alphanumeric characters'
    }
    if (editingCourse.duration_years < 1 || editingCourse.duration_years > 6) {
      newErrors.duration_years = 'Duration must be between 1 and 6 years'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: editingCourse.name.trim(),
        code: editingCourse.code.trim().toUpperCase(),
        description: editingCourse.description.trim() || null,
        duration_years: parseInt(editingCourse.duration_years)
      }
      
      const response = await fetch(`${API_BASE_URL}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update course')
      }

      // Refresh courses list
      await fetchCourses()
      
      // Close modal and reset
      setShowEditModal(false)
      setEditingCourse(null)
      setErrors({})
      showToast('Course updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating course:', error)
      showToast(error.message || 'Failed to update course', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingCourse(null)
    setErrors({})
  }

  const closeAssignModal = () => {
    setShowAssignModal(false)
    setSelectedCourse(null)
  }

  const deleteCourse = async (courseId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete course')
      }

      // Refresh courses list after successful deletion
      await fetchCourses()
      showToast('Course deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting course:', error)
      showToast(error.message || 'Failed to delete course', 'error')
    } finally {
      setLoading(false)
    }
  }

  // API Functions
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      console.log('Fetching courses with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Courses data:', data)
      console.log('First course teacher_courses:', data.courses?.[0]?.teacher_courses)
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      showToast(`Failed to fetch courses: ${error.message}`, 'error')
    } finally {
      setLoading(false)
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

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/student`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const createCourse = async (courseData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/courses/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create course')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating course:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  React.useEffect(() => {
    fetchCourses()
    fetchTeachers()
    fetchStudents()
  }, [])

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  console.log('Courses state:', courses)
  console.log('Filtered courses:', filteredCourses)

  return (
    <div className="min-h-screen flex" style={{ background: "#f8f9fa" }}>
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Create New Course */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Course</h2>
              
              <div className="space-y-4">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Enter course name"
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

                {/* Course Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Enter course code (2-10 chars)"
                      value={formData.code}
                      onChange={(e) => {
                        handleInputChange('code', e.target.value)
                        if (errors.code) {
                          setErrors(prev => ({ ...prev, code: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Years)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.duration_years}
                      onChange={(e) => {
                        handleInputChange('duration_years', e.target.value)
                        if (errors.duration_years) {
                          setErrors(prev => ({ ...prev, duration_years: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.duration_years ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.duration_years && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration_years}</p>
                  )}
                </div>

                {/* Create Course Button */}
                <button
                  onClick={handleCreateCourse}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Creating Course...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-2/3 space-y-6">
            {/* Courses List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Courses List</h2>
                
                {/* Filter Controls */}
                <div className="flex gap-4 items-center">
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
                    <div className="text-gray-500">Loading courses...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.code}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {course.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {course.duration_years} {course.duration_years === 1 ? 'Year' : 'Years'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {course.teacher_courses && course.teacher_courses.length > 0 ? (
                                course.teacher_courses.map((tc, index) => (
                                  <span key={tc.teacher.id} className="px-5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {tc.teacher.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">No teachers</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditCourse(course)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCourse(course.id, course.name)}
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
                    Showing 1 to {filteredCourses.length} of {filteredCourses.length} entries
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
   
          {/* Edit Course Modal */}
          {showEditModal && editingCourse && (
            <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Course</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input
                      type="text"
                      value={editingCourse.name}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                    <input
                      type="text"
                      value={editingCourse.code}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, code: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Years)</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={editingCourse.duration_years}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, duration_years: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                        errors.duration_years ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.duration_years && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration_years}</p>
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
                      onClick={handleUpdateCourse}
                      disabled={loading}
                      className={`flex-1 px-4 py-2 rounded-lg text-white ${
                        loading 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-[#9886FE] hover:bg-[#7c6cf8]'
                      }`}
                    >
                      {loading ? 'Updating...' : 'Update Course'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign User Modal */}
          {showAssignModal && selectedCourse && (
            <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assign {assignType === 'teacher' ? 'Teacher' : 'Student'} to {selectedCourse.name}
                  </h3>
                  <button
                    onClick={closeAssignModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    {(assignType === 'teacher' ? teachers : students).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleAssignUser(user.id)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm ${
                            loading 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                          }`}
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeAssignModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
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
    </div>
  )
}

export default Courses 