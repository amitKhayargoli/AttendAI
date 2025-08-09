import React from 'react';
import { 
  BarChart3,
  Calendar,
  Users,
  FileText,
  Settings,
  User
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const TeacherNavbar = () => {
  const location = useLocation();

  // Extract the current page from the pathname
  const path = location.pathname;

  const isActive = (target) =>
    path === target || path.startsWith(target + '/');

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">AttendAI</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link 
            to="/teacher-dashboard" 
            className={`flex items-center space-x-2 ${
              isActive('/teacher-dashboard') 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/class-timeline" 
            className={`flex items-center space-x-2 ${
              isActive('/class-timeline') 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </Link>

          <Link 
            to="/manage-attendance" 
            className={`flex items-center space-x-2 ${
              isActive('/manage-attendance') 
                ? 'text-[#7c6cf8] font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </Link>


        </div>

        {/* Settings & Profile */}
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
