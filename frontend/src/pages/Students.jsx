import React, { useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { Search, User, GraduationCap, Phone, Calendar, Mail, Filter, Edit, Trash2, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    course: '',
    contactNumber: '',
    enrollmentDate: '',
    personalEmail: ''
  })

  const [suggestedEmail, setSuggestedEmail] = useState('sarah.johnson@attendai.edu.np')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [editingStudent, setEditingStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const courses = ['Computer Science', 'Data Science', 'Business Analytics', 'Information Technology']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const generateEmail = (fullName) => {
    if (fullName && fullName.trim()) {
      const nameParts = fullName.toLowerCase().trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts[nameParts.length - 1]
      // Get the JWT token from localStorage (or wherever it's stored)
      const token = localStorage.getItem('token');
      let domain = 'attendai'; // fallback domain
      if (token) {
        try {
          // JWT is in format header.payload.signature, payload is base64url encoded
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && payload.email) {
            // email is like admin@softwarica.edu.np
            const emailParts = payload.email.split('@');
            if (emailParts.length === 2) {
              const domainPart = emailParts[1].split('.')[0];
              if (domainPart) {
                domain = domainPart;
              }
            }
          }
        } catch (e) {
          // fallback to default domain
        }
      }
      const email = `${firstName}.${lastName}@${domain}.edu.np`
      setSuggestedEmail(email)
    } else {
      setSuggestedEmail('')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.course) {
      newErrors.course = 'Please select a course'
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number'
    }
    
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'Enrollment date is required'
    } else {
      const selectedDate = new Date(formData.enrollmentDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.enrollmentDate = 'Enrollment date cannot be in the future'
      }
    }
    
    // Check if email can be generated (requires full name)
    if (!formData.fullName.trim()) {
      newErrors.suggestedEmail = 'Please enter the student details to generate email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterStudent = async () => {
    if (validateForm()) {
      try {
        const password = generateRandomPassword()
        setGeneratedPassword(password)
        
        const studentData = {
          name: formData.fullName.trim(),
          email: suggestedEmail,
          personal_email: formData.personalEmail.trim() || null,
          password: password,
          course: formData.course,
          contact: formData.contactNumber,
          enrollment_date: formData.enrollmentDate
        }

        const result = await createStudent(studentData)
        
        // Store credentials from API response
        setApiCredentials(result.credentials)
        
        // Refresh students list
        await fetchStudents()
        
        // Reset form
        setFormData({
          fullName: '',
          course: '',
          contactNumber: '',
          enrollmentDate: '',
          personalEmail: ''
        })
        
        setErrors({})
        setShowSuccessMessage(true)
        showToast('Student registered successfully!', 'success')
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false)
          setGeneratedPassword('')
          setApiCredentials(null)
        }, 3000)
      } catch (error) {
        showToast(error.message || 'Failed to register student', 'error')
        setGeneratedPassword('')
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error')
    }
  }

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [apiCredentials, setApiCredentials] = useState(null)

  // API Functions
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchStudents = async () => {
    try {
      setLoading(true)
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
      showToast('Failed to fetch students', 'error')
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (studentData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/student/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create student')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (studentId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete student')
      }

      // Refresh students list after successful deletion
      await fetchStudents()
      showToast('Student deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting student:', error)
      showToast(error.message || 'Failed to delete student', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      deleteStudent(studentId)
    }
  }

  const handleEditStudent = (student) => {
    setEditingStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      personal_email: student.personal_email,
      course: student.course,
      contact: student.contact,
      enrollment_date: student.enrollment_date
    })
    setShowEditModal(true)
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    // Validate edit form
    const newErrors = {}
    if (!editingStudent.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!editingStudent.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!editingStudent.course) {
      newErrors.course = 'Course is required'
    }
    if (!editingStudent.contact.trim()) {
      newErrors.contact = 'Contact is required'
    }
    if (!editingStudent.enrollment_date) {
      newErrors.enrollment_date = 'Enrollment date is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: editingStudent.name.trim(),
        email: editingStudent.email.trim(),
        personal_email: editingStudent.personal_email.trim() || null,
        course: editingStudent.course,
        contact: editingStudent.contact,
        enrollment_date: editingStudent.enrollment_date
      }
      console.log('Sending update data:', updateData)
      console.log('Student ID:', editingStudent.id)
      
      const response = await fetch(`${API_BASE_URL}/student/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Update error response:', errorData)
        throw new Error(errorData.error || 'Failed to update student')
      }

      // Refresh students list
      await fetchStudents()
      
      // Close modal and reset
      setShowEditModal(false)
      setEditingStudent(null)
      setErrors({})
      showToast('Student updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating student:', error)
      showToast(error.message || 'Failed to update student', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingStudent(null)
    setErrors({})
  }

  // Load students on component mount
  React.useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredByCourse = selectedCourse === 'All Courses' 
    ? filteredStudents 
    : filteredStudents.filter(student => student.course === selectedCourse)

  return (
    <div className="min-h-screen flex" style={{ background: "#f8f9fa" }}>
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Register New Student */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Student</h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={(e) => {
                        const newValue = e.target.value
                        handleInputChange('fullName', newValue)
                        generateEmail(newValue)
                        // Clear error when user starts typing
                        if (errors.fullName) {
                          setErrors(prev => ({ ...prev, fullName: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Course Enrolled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Enrolled</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={formData.course}
                      onChange={(e) => {
                        handleInputChange('course', e.target.value)
                        // Clear error when user selects a course
                        if (errors.course) {
                          setErrors(prev => ({ ...prev, course: '' }))
                        }
                      }}
                      className={`pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none ${
                        errors.course ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select course</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  {errors.course && (
                    <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      placeholder="Enter contact number"
                      value={formData.contactNumber}
                      onChange={(e) => {
                        handleInputChange('contactNumber', e.target.value)
                        // Clear error when user starts typing
                        if (errors.contactNumber) {
                          setErrors(prev => ({ ...prev, contactNumber: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>

                {/* Enrollment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      placeholder="yyyy / mm / dd"
                      value={formData.enrollmentDate}
                      onChange={(e) => {
                        handleInputChange('enrollmentDate', e.target.value)
                        // Clear error when user selects a date
                        if (errors.enrollmentDate) {
                          setErrors(prev => ({ ...prev, enrollmentDate: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.enrollmentDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.enrollmentDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.enrollmentDate}</p>
                  )}
                </div>

                {/* Personal Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      placeholder="Enter personal email (optional)"
                      value={formData.personalEmail}
                      onChange={(e) => {
                        handleInputChange('personalEmail', e.target.value)
                        // Clear error when user starts typing
                        if (errors.personalEmail) {
                          setErrors(prev => ({ ...prev, personalEmail: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.personalEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.personalEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.personalEmail}</p>
                  )}
                </div>

                {/* Register Student Button */}
                <button
                  onClick={handleRegisterStudent}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Creating Student...' : 'Register Student'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-2/3 space-y-6">
            {/* Email Generator */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Generator</h2>
              
              {showSuccessMessage ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Account Created Successfully</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="text-gray-400 h-5 w-5" />
                    <span className="text-sm font-medium text-gray-700">Suggested Email</span>
                  </div>
                  <div className={`p-3 rounded-lg mb-4 ${
                    errors.suggestedEmail 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-gray-50'
                  }`}>
                    <span className={errors.suggestedEmail ? 'text-red-600' : 'text-gray-900'}>
                      {suggestedEmail || 'No email generated'}
                    </span>
                  </div>
                  {errors.suggestedEmail && (
                    <p className="text-sm text-red-600 mb-4">{errors.suggestedEmail}</p>
                  )}
                </>
              )}
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Students List</h2>
                
                {/* Filter Controls */}
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none"
                    >
                      <option value="All Courses">All Courses</option>
                      {courses.map(course => (
                        <option key={course} value={course}>{course}</option>
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
                    <div className="text-gray-500">Loading students...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredByCourse.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.personal_email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditStudent(student)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(student.id, student.name)}
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
                    Showing 1 to {filteredByCourse.length} of {filteredByCourse.length} entries
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
      </div>

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Personal Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                <input
                  type="email"
                  value={editingStudent.personal_email}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, personal_email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                    errors.personalEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.personalEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalEmail}</p>
                )}
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={editingStudent.course}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, course: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none ${
                    errors.course ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={editingStudent.contact}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, contact: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                    errors.contact ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>

              {/* Enrollment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                <input
                  type="date"
                  value={editingStudent.enrollment_date}
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, enrollment_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                    errors.enrollment_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.enrollment_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.enrollment_date}</p>
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
                  onClick={handleUpdateStudent}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    loading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-[#9886FE] hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Student'}
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
  )
}

export default Students 