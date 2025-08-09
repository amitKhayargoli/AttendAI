import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Clock, 
  Award,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { SidebarProvider } from "@/components/ui/sidebar";
import StudentSidebar from "./StudentSidebar";
import { AttendanceLineChart } from './AttendanceLineChart';

const StudentDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // Mock data for the dashboard
  const testScores = [
    { date: 'Apr 10', score: 65 },
    { date: 'Apr 11', score: 75 },
    { date: 'Apr 12', score: 80 },
    { date: 'Apr 13', score: 85 },
    { date: 'Apr 14', score: 70 },
    { date: 'Apr 15', score: 90 },
    { date: 'Apr 16', score: 88 }
  ];

  const dailySchedule = [
    { time: '8:00 AM', subject: 'Data Science', type: 'class' },
    { time: '9:00 AM', subject: 'NLP', type: 'class' },
    { time: '10:00 AM', subject: 'Break', type: 'break' },
    { time: '10:15 AM', subject: 'Statistics', type: 'class' },
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

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <StudentSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto ">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-medium text-gray-900">Welcome Back, Amit 👋</h1>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-6">

           {/* Attendance Line Chart */}
           <div className="col-span-6">
                <AttendanceLineChart />
              </div>

              {/* Attendance Donut Chart */}
              <div className="col-span-3">
                <Card className="h-80">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-0">
                      <h3 className="text-lg font-normal text-gray-900">Attendance</h3>
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {/* Donut Chart */}
                    <div className="flex justify-center">
                      <div className="">
                        <div className="w-42 h-42 p-5 py-8 mb-2 bg-white border-36 border-[#9886fe] border-t-[#FBBF24] rounded-full">
                          <div className="inset-0 flex items-center justify-center">
                            <span className="text-2xl font-medium text-gray-900">80%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#9886fe] rounded-full"></div>
                        <span className="text-sm text-gray-600">Present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Absent</span>
                      </div>
                    </div>
                    
                    {/* Dropdowns */}
                    <div className="flex items-center gap-2">
                      <select className="bg-[#F5F4F9] rounded-md w-full text-sm border border-gray-300 px-3 py-2">
                        <option>July 2025</option>
                      </select>
                      <select className="bg-[#F5F4F9] w-full text-sm border border-gray-300 rounded-md px-3 py-2">
                        <option>Semester 4</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Schedule */}
              <div className="col-span-4">
                <Card className="h-80">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-normal text-gray-900">Monday</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {dailySchedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">{item.time}</span>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            item.type === 'break' 
                              ? 'bg-purple-100 text-purple-700'
                              : item.type === 'lunch'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'text-gray-900'
                          }`}>
                            {item.subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

   
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
6