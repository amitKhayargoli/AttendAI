import React from 'react';
import { 
  BarChart3,
  Calendar,
  BookOpen,
  Users,
  FileText,
  Settings,
  User
} from 'lucide-react';

const TeacherNavbar = ({ activePage = 'calendar' }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 1st div - AttendAI Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">AttendAI</h1>
        </div>

        {/* 2nd div - Navigation Links */}
        <div className="flex items-center space-x-6">
          <a 
            href="#" 
            className={`flex items-center space-x-2 ${
              activePage === 'dashboard' 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center space-x-2 ${
              activePage === 'calendar' 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center space-x-2 ${
              activePage === 'classes' 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Classes</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center space-x-2 ${
              activePage === 'students' 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center space-x-2 ${
              activePage === 'reports' 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Reports</span>
          </a>
        </div>

        {/* 3rd div - Settings and Profile */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <Settings className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <User className="h-5 w-5" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default TeacherNavbar; 