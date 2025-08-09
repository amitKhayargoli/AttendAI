import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Grid3X3, List, Loader2 } from "lucide-react";
import AttendanceModal from "@/components/AttendanceModal";
import StudentSidebar from './StudentSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const StudentAttendance = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterClass, setFilterClass] = useState('all');
  const [sortBy, setSortBy] = useState('schedule');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Fetching student classes...'); // Debug log

        const response = await fetch('http://localhost:5000/api/class/student/classes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status); // Debug log

        if (response.ok) {
          const data = await response.json();
          console.log('Classes data:', data); // Debug log
          setClasses(data.classes || []);
        } else {
          const errorData = await response.json();
          console.error('API Error:', errorData); // Debug log
          setError(errorData.error || 'Failed to fetch classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to fetch classes. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filteredClasses = classes;

    // Apply status filter
    if (filterClass !== 'all') {
      filteredClasses = classes.filter(classItem => classItem.status === filterClass);
    }

    // Apply sorting
    const sortedClasses = [...filteredClasses].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'schedule':
        default:
          // Sort by schedule priority: active > upcoming > recorded
          const statusPriority = { active: 1, upcoming: 2, recorded: 3 };
          return statusPriority[a.status] - statusPriority[b.status];
      }
    });

    return sortedClasses;
  }, [classes, filterClass, sortBy]); // Added classes dependency

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-yellow-500 text-white", text: "Session Active" },
      upcoming: { color: "bg-gray-300 text-gray-700", text: "Upcoming" },
      recorded: { color: "bg-purple-200 text-purple-700", text: "Recorded" }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <Badge className={`${config.color} rounded-full px-3 py-1 text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  const handleMarkAttendance = (classItem) => {
    console.log(`Opening attendance modal for class: ${classItem.title}`);
    setSelectedClass(classItem);
    setIsAttendanceModalOpen(true);
  };

  const handleCloseAttendanceModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  return (
    
    <SidebarProvider>

    <StudentSidebar/>
    <div className="p-6 w-full">


      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes & Attendance</h1>
        <div className="text-sm text-gray-500">Dashboard / My Classes</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-9 w-9 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-9 w-9 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="active">Active Sessions</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="recorded">Recorded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by Schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="schedule">Sort by Schedule</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Debug Info */}
      {!loading && !error && (
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-800">
           Total classes: {classes.length}, Filtered: {filteredAndSortedClasses.length}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading classes...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">Error loading classes</div>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

       {/* Class Cards Grid */}
      {!loading && !error && filteredAndSortedClasses.length > 0 && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedClasses.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {classItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {classItem.subjectName} ({classItem.subjectCode})
                    </p>
                  </div>
                  {getStatusBadge(classItem.status)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Teacher: {classItem.teacherName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Room: {classItem.roomNumber}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleMarkAttendance(classItem)}
                  disabled={!classItem.canMarkAttendance}
                  className={`w-full ${
                    classItem.canMarkAttendance
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {classItem.canMarkAttendance ? 'Mark Attendance' : 'Attendance Closed'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterClass !== 'all' ? `No ${filterClass} classes found` : 'No classes found'}
          </h3>
          <p className="text-gray-500">
            {filterClass !== 'all' 
              ? `Try changing your filter to see more classes.`
              : 'You don\'t have any classes assigned yet. Please contact your administrator.'
            }
          </p>
        </div>
      )}

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseAttendanceModal}
        subjectName={selectedClass?.title || "Class"}
        classId={selectedClass?.id} // Make sure this is being passed
      />
    </div>
    </SidebarProvider>
  );
};

export default StudentAttendance;