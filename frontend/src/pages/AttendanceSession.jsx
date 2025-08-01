import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TeacherNavbar from "@/components/TeacherNavbar";
import { 
  Clock, 
  MapPin, 
  BookOpen, 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

const AttendanceSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  // Get class details from navigation state
  const classDetails = location.state?.classDetails || {
    name: 'Advanced Mathematics 101',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    roomNumber: 'Room 305',
    subject: 'Mathematics'
  };

  // Timer effect for active session
  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          // Auto-end session after 5 minutes (300 seconds)
          if (newTime >= 300) {
            setSessionActive(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setSessionActive(true);
    setSessionTime(0);
    setPresentCount(0);
    setAbsentCount(0);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setSessionTime(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <TeacherNavbar activePage="classes" />

      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Class Details Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {classDetails.name}
                </h2>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{classDetails.startTime} - {classDetails.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{classDetails.roomNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{classDetails.subject}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <Button 
                  onClick={() => navigate('/class-timeline')}
                  variant="outline" 
                  className="flex items-center space-x-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Calendar</span>
                </Button>
              </div>
            </div>
            {!sessionActive && (
              <Button 
                onClick={handleStartSession}
                className="w-full !bg-[#7c6cf8] !hover:bg-[#6b5ce7] cursor-pointer text-white py-3 rounded-lg"
              >
                Start Attendance Session
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Active Session Card */}
        {sessionActive && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Active Session</h3>
                <Button 
                  onClick={handleEndSession}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  End Session
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                 <div className="text-gray-600">
                 Time remaining: {formatTime(300 - sessionTime)}
                 </div>
               </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Total Students: 30</span>
                </div>

                <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-900 font-medium">Present: {presentCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-gray-900 font-medium">Absent: {absentCount}</span>
                </div>
                </div>
              </div>

              
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttendanceSession; 