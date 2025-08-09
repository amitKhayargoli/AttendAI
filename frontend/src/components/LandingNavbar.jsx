import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export const LandingNavbar = () => {
  const [mobileDrawer, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl rounded-full py-3 px-16 shadow-lg border border-white/20 sm:mt-4">
      <div className="flex justify-between items-center min-w-[800px]">
        {/* Left - Logo */}
        <div className="flex items-center flex-shrink-0">
          <span className="text-xl font-bold text-black">AttendAI</span>
        </div>
        
        {/* Center - Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8">


        </div>
        
        {/* Right - Login Button */}
        <div className="hidden lg:flex items-center">
          <a href="/login" className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-full font-medium transition-colors duration-200">
            Login
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={toggleNavbar} className="text-black">
            {mobileDrawer ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {mobileDrawer && (
        <div className="fixed top-0 left-0 z-20 bg-white w-full h-screen p-8 flex flex-col justify-center items-center lg:hidden">
          <ul className="space-y-6 text-center">

            <li>
              <a href="#" className="text-black hover:text-gray-600">Features</a>
            </li>
            <li>
              <a href="#" className="text-black hover:text-gray-600">Pricing</a>
            </li>
            <li>
              <a href="#" className="text-black hover:text-gray-600">Contact</a>
            </li>
          </ul>
          <div className="mt-8">
            <a href="#" className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-8 rounded-full font-medium transition-colors duration-200">
              Login
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
