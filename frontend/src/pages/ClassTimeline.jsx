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
  MapPin
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
  const [classes, setClasses] = useState([
    {
      id: 1,
      time: "09:23",
      title: "Accounts and tax",
      type: "Room 301",
      startTime: "9:00 AM",
      duration: 60,
      color: "bg-yellow-100",
      isActive: false
    },
    {
      id: 2,
      time: "10:20",
      title: "Business plans",
      type: "Room 302",
      startTime: "10:00 AM",
      duration: 60,
      color: "bg-white",
      isActive: false
    },
    {
      id: 3,
      time: "11:35",
      title: "Risk analysis",
      type: "Room 303",
      startTime: "11:00 AM",
      duration: 60,
      color: "bg-white",
      isActive: false
    },
    {
      id: 4,
      time: "12:00",
      title: "Preparing budget forecasts",
      type: "Room 304",
      startTime: "12:00 PM",
      duration: 60,
      color: "bg-white",
      isActive: false
    }
  ]);



  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", 
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);

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

  // Function to check if a class is currently active
  const isClassCurrentlyActive = (cls) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    const startMinutes = timeToMinutes(cls.startTime);
    const endMinutes = startMinutes + cls.duration;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  // Function to update active class based on current time
  const updateActiveClass = () => {
    const updatedClasses = classes.map(cls => ({
      ...cls,
      isActive: isClassCurrentlyActive(cls)
    }));
    setClasses(updatedClasses);
  };

  // Update active class on component mount and every minute
  useEffect(() => {
    // Initial update
    updateActiveClass();
    
    // Set up interval to check every minute
    const interval = setInterval(updateActiveClass, 60000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <TeacherNavbar activePage="calendar" />

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-[calc(100vh-70px)] p-6">
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
              {days.map((day, index) => (
                <div key={index} className="text-center py-2">
                  {day && (
                    <button
                      onClick={() => setSelectedDate(day)}
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
        <div className="flex-1 p-6">
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
                         <Button className="!bg-[#7c6cf8] !hover:bg-[#6b5ce7] cursor-pointer">
               <Plus className="h-4 w-4 mr-2" />
               Add Class
             </Button>
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
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
                                                           {/* Classes */}
                 {classes.map((cls) => (
                   <div
                     key={cls.id}
                                           className={`absolute left-8 right-4 rounded-lg border-l-4 p-3 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${
                        cls.isActive 
                          ? 'bg-[rgba(251,191,36,0.2)] border-l-4' 
                          : 'bg-white border-l-4'
                      }`}
                      style={{
                        top: `${getClassPosition(cls.startTime)}px`,
                        height: `${cls.duration + 20}px`,
                        borderLeftColor: cls.isActive ? '#FBBF24' : '#9886FE'
                      }}
                      onClick={() => navigate('/attendance-session')}
                   >
                                       <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-500">{cls.time}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {cls.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{cls.title}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <span className="text-lg">⋯</span>
                      </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassTimeline;
