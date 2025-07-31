import React, { useState } from 'react'
import AdminSidebar from '../AdminSidebar'
import { Search, BookOpen, Hash, TrendingUp, User, Filter, Edit, Trash2, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: '',
    teacher_id: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [editingSubject, setEditingSubject] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const levels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']

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
      newErrors.name = 'Subject name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Subject name must be at least 2 characters'
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required'
    } else if (!/^[A-Za-z0-9]{3,10}$/.test(formData.code.trim())) {
      newErrors.code = 'Subject code must be 3-10 alphanumeric characters'
    }
    
    if (!formData.level) {
      newErrors.level = 'Please select a level'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterSubject = async () => {
    if (validateForm()) {
      try {
        const subjectData = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          level: formData.level,
          teacher_id: formData.teacher_id || null
        }

        const result = await createSubject(subjectData)
        
        // Refresh subjects list
        await fetchSubjects()
        
        // Reset form
        setFormData({
          name: '',
          code: '',
          level: '',
          teacher_id: ''
        })
        
        setErrors({})
        showToast('Subject registered successfully!', 'success')
      } catch (error) {
        showToast(error.message || 'Failed to register subject', 'error')
      }
    } else {
      showToast('Please fill in all required fields correctly', 'error')
    }
  }

  const handleDeleteSubject = (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to delete ${subjectName}?`)) {
      deleteSubject(subjectId)
    }
  }

  const handleEditSubject = (subject) => {
    setEditingSubject({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      level: subject.level,
      teacher_id: subject.teacher_id || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateSubject = async () => {
    if (!editingSubject) return

    // Validate edit form
    const newErrors = {}
    if (!editingSubject.name.trim()) {
      newErrors.name = 'Subject name is required'
    }
    if (!editingSubject.code.trim()) {
      newErrors.code = 'Subject code is required'
    } else if (!/^[A-Za-z0-9]{3,10}$/.test(editingSubject.code.trim())) {
      newErrors.code = 'Subject code must be 3-10 alphanumeric characters'
    }
    if (!editingSubject.level) {
      newErrors.level = 'Level is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: editingSubject.name.trim(),
        code: editingSubject.code.trim().toUpperCase(),
        level: editingSubject.level,
        teacher_id: editingSubject.teacher_id || null
      }
      console.log('Sending update data:', updateData)
      console.log('Subject ID:', editingSubject.id)
      
      const response = await fetch(`${API_BASE_URL}/subject/${editingSubject.id}`, {
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
        throw new Error(errorData.error || 'Failed to update subject')
      }

      // Refresh subjects list
      await fetchSubjects()
      
      // Close modal and reset
      setShowEditModal(false)
      setEditingSubject(null)
      setErrors({})
      showToast('Subject updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating subject:', error)
      showToast(error.message || 'Failed to update subject', 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingSubject(null)
    setErrors({})
  }

  const deleteSubject = async (subjectId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/subject/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete subject')
      }

      // Refresh subjects list after successful deletion
      await fetchSubjects()
      showToast('Subject deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting subject:', error)
      showToast(error.message || 'Failed to delete subject', 'error')
    } finally {
      setLoading(false)
    }
  }

  // API Functions
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchSubjects = async () => {
    try {
      setLoading(true)
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
      showToast('Failed to fetch subjects', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/subject/teachers`, {
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

  const createSubject = async (subjectData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/subject/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subjectData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subject')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating subject:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Load subjects and teachers on component mount
  React.useEffect(() => {
    fetchSubjects()
    fetchTeachers()
  }, [])

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredByLevel = selectedLevel === 'All Levels' 
    ? filteredSubjects 
    : filteredSubjects.filter(subject => subject.level === selectedLevel)

  return (
    <div className="min-h-screen flex"
     style={{ background: "#f8f9fa" }}>
      <AdminSidebar />
      
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Subjects</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Column - Register New Subject */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Subject</h2>
              
              <div className="space-y-4">
                {/* Subject Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Enter subject name"
                      value={formData.name}
                      onChange={(e) => {
                        handleInputChange('name', e.target.value)
                        // Clear error when user starts typing
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

                {/* Subject Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Enter subject code (3-10 chars)"
                      value={formData.code}
                      onChange={(e) => {
                        handleInputChange('code', e.target.value)
                        // Clear error when user starts typing
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

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={formData.level}
                      onChange={(e) => {
                        handleInputChange('level', e.target.value)
                        // Clear error when user selects a level
                        if (errors.level) {
                          setErrors(prev => ({ ...prev, level: '' }))
                        }
                      }}
                      className={`pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none ${
                        errors.level ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                  )}
                </div>

                {/* Assign Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Teacher (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                      className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent w-full appearance-none"
                    >
                      <option value="">Select teacher (optional)</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                </div>

                {/* Register Subject Button */}
                <button
                  onClick={handleRegisterSubject}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9886FE] text-white hover:bg-[#7c6cf8]'
                  }`}
                >
                  {loading ? 'Creating Subject...' : 'Register Subject'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-2/3 space-y-6">
            {/* Subjects List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subjects List</h2>
                
                {/* Filter Controls */}
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none"
                    >
                      <option value="All Levels">All Levels</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
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
                    <div className="text-gray-500">Loading subjects...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredByLevel.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subject.code}
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               subject.level === 'First Year' ? 'bg-blue-100 text-blue-800' :
                               subject.level === 'Second Year' ? 'bg-green-100 text-green-800' :
                               subject.level === 'Third Year' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-purple-100 text-purple-800'
                             }`}>
                               {subject.level}
                             </span>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subject.teacher_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditSubject(subject)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSubject(subject.id, subject.name)}
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
                    Showing 1 to {filteredByLevel.length} of {filteredByLevel.length} entries
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

        {/* Edit Subject Modal */}
        {showEditModal && editingSubject && (
          <div className="fixed inset-0 bg-[#05050560] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Subject</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject(prev => ({ ...prev, name: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                  <input
                    type="text"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject(prev => ({ ...prev, code: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={editingSubject.level}
                    onChange={(e) => setEditingSubject(prev => ({ ...prev, level: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none ${
                      errors.level ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-600">{errors.level}</p>
                  )}
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Teacher (Optional)</label>
                  <select
                    value={editingSubject.teacher_id}
                    onChange={(e) => setEditingSubject(prev => ({ ...prev, teacher_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9886FE] focus:border-transparent appearance-none"
                  >
                    <option value="">Select teacher (optional)</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
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
                    onClick={handleUpdateSubject}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${
                      loading 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-[#9886FE] hover:bg-[#7c6cf8]'
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Subject'}
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

export default Subjects
