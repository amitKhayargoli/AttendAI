import React, { useState } from "react";
import { Link as ScrollLink } from "react-scroll"; // Import from react-scroll
import { Link } from "react-router-dom"; // React Router for normal navigation
import { navItems } from "./index";
import { Menu, X } from "lucide-react";

export const LandingNavbar = () => {
  const [mobileDrawer, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-50 rounded-full py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative tx-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img src={"/scan.png"} alt="logo" className="h-10 w-10 mr-2" />
            <span className="text-xl tracking-tight">AttendAI</span>
          </div>
          <ul className="hidden lg:flex ml-14 space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.href.startsWith("#") ? (
                  <ScrollLink
                    to={item.href.substring(1)}
                    smooth={true}
                    duration={500}
                    className="cursor-pointer text-black hover:text-gray-400"
                  >
                    {item.label}
                  </ScrollLink>
                ) : (
                  <Link
                    to={item.href}
                    className="text-white hover:text-gray-400"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex justify-center items-center space-x-12">
            <Link to="/login" className="py-2 px-3 border rounded-full">
              Log In
            </Link>
            <a href="#" className="bg-black text-white py-2 px-3 rounded-full">
              Create an account
            </a>
          </div>
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawer ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileDrawer && (
          <div className="fixed right-0 z-20  bg-neutral-900 w-full p-12 flex flex-col justify-center items-center lg:hidden">
            <ul>
              {navItems.map((item, index) => (
                <li key={index} className="py-4">
                  {item.href.startsWith("#") ? (
                    <ScrollLink
                      to={item.href.substring(1)}
                      smooth={true}
                      duration={500}
                      className="cursor-pointer text-white hover:text-gray-400"
                      onClick={toggleNavbar}
                    >
                      {item.label}
                    </ScrollLink>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-white hover:text-gray-400"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex space-x-6">
              <Link
                to="/login"
                className="py-2 px-3 border rounded-md text-white"
              >
                Log In
              </Link>
              <a href="#" className="py-2 rounded-md text-white">
                Create an account
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
