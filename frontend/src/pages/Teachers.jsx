import React, { useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { Search, User, Mail, Phone, Calendar, Filter, Edit, Trash2, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    joinedDate: ''
  })

  const [suggestedEmail, setSuggestedEmail] = useState('john.doe@attendai.edu.np')
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number'
    }
    
    if (!formData.joinedDate) {
      newErrors.joinedDate = 'Joined date is required'
    } else {
      const selectedDate = new Date(formData.joinedDate)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.joinedDate = 'Joined date cannot be in the future'
      }
    }
    
    // Check if email can be generated (requires full name)
    if (!formData.fullName.trim()) {
      newErrors.suggestedEmail = 'Please enter the teacher details to generate email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterTeacher = async () => {
    if (validateForm()) {
      try {
        const password = generateRandomPassword()
        setGeneratedPassword(password)
        
        const teacherData = {
          name: formData.fullName.trim(),
          email: suggestedEmail,
          password: password,
          contact: formData.contactNumber,
          joined_at: formData.joinedDate
        }

        const result = await createTeacher(teacherData)
        
        // Store credentials from API response
        setApiCredentials(result.credentials)
        
        // Refresh teachers list
        await fetchTeachers()
        
        // Reset form
        setFormData({
          fullName: '',
          contactNumber: '',
          joinedDate: ''
        })
        
        setErrors({})
        setShowSuccessMessage(true)
        showToast('Teacher registered successfully!', 'success')
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false)
          setGeneratedPassword('')
          setApiCredentials(null)
        }, 3000)
      } catch (error) {
        showToast(error.message || 'Failed to register teacher', 'error')
        setGeneratedPassword('')
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error')
    }
  }

  const handleDeleteTeacher = (teacherId, teacherName) => {
    if (window.confirm(`Are you sure you want to delete ${teacherName}?`)) {
      deleteTeacher(teacherId)
    }
  }

  const handleEditTeacher = (teacher) => {
    setEditingTeacher({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      contact: teacher.contact,
      joined_at: teacher.joined_at
    })
    setShowEditModal(true)
  }

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return

    // Validate edit form
    const newErrors = {}
    if (!editingTeacher.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!editingTeacher.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!editingTeacher.contact.trim()) {
      newErrors.contact = 'Contact is required'
    }
    if (!editingTeacher.joined_at) {
      newErrors.joined_at = 'Joined date is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: editingTeacher.name.trim(),
        email: editingTeacher.email.trim(),
        contact: editingTeacher.contact,
        joined_at: editingTeacher.joined_at
      }
      console.log('Sending update data:', updateData)
      console.log('Teacher ID:', editingTeacher.id)
      
      const response = await fetch(`${API_BASE_URL}/teacher/${editingTeacher.id}`, {
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
        throw new Error(errorData.error || 'Failed to update teacher')
      }

      // Refresh teachers list
      await fetchTeachers()
      
      // Close modal and reset
      setShowEditModal(false)
      setEditingTeacher(null)
      setErrors({})
      showToast('Teacher updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating teacher:', error)
      showToast(error.message || 'Failed to update teacher', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingTeacher(null)
    setErrors({})
  }

  const deleteTeacher = async (teacherId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/teacher/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete teacher')
      }

      // Refresh teachers list after successful deletion
      await fetchTeachers()
      showToast('Teacher deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting teacher:', error)
      showToast(error.message || 'Failed to delete teacher', 'error')
    } finally {
      setLoading(false)
    }
  }

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [apiCredentials, setApiCredentials] = useState(null)

  // API Functions
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchTeachers = async () => {
    try {
      setLoading(true)
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
      showToast('Failed to fetch teachers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const createTeacher = async (teacherData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/teacher/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create teacher')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating teacher:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load teachers on component mount
  React.useEffect(() => {
    fetchTeachers()
  }, [])

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen flex" style={{ background: "#f8f9fa" }}>
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Register New Teacher */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Teacher</h2>
              
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

                {/* Joined Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      placeholder="yyyy / mm / dd"
                      value={formData.joinedDate}
                      onChange={(e) => {
                        handleInputChange('joinedDate', e.target.value)
                        // Clear error when user selects a date
                        if (errors.joinedDate) {
                          setErrors(prev => ({ ...prev, joinedDate: '' }))
                        }
                      }}
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full ${
                        errors.joinedDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.joinedDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.joinedDate}</p>
                  )}
                </div>

                {/* Register Teacher Button */}
                <button
                  onClick={handleRegisterTeacher}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Creating Teacher...' : 'Register Teacher'}
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

            {/* Teachers List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Teachers List</h2>
                
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
                    <div className="text-gray-500">Loading teachers...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(teacher.joined_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditTeacher(teacher)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
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
                    Showing 1 to {filteredTeachers.length} of {filteredTeachers.length} entries
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

        {/* Edit Teacher Modal */}
        {showEditModal && editingTeacher && (
          <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Teacher</h3>
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
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher(prev => ({ ...prev, name: e.target.value }))}
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
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={editingTeacher.contact}
                    onChange={(e) => setEditingTeacher(prev => ({ ...prev, contact: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.contact ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                  )}
                </div>

                {/* Joined Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
                  <input
                    type="date"
                    value={editingTeacher.joined_at}
                    onChange={(e) => setEditingTeacher(prev => ({ ...prev, joined_at: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.joined_at ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.joined_at && (
                    <p className="mt-1 text-sm text-red-600">{errors.joined_at}</p>
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
                    onClick={handleUpdateTeacher}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${
                      loading 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-[#9886FE] hover:bg-[#7c6cf8]'
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Teacher'}
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

export default Teachers
