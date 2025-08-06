import React from "react";
import { Users, BookOpen, GraduationCap } from "lucide-react";

const LandingHero = () => {
  return (
    <div
      id="hero-section"
      className="min-h-screen bg-gradient-to-b mt-10 from-white via-purple-50 to-purple-100 py-8 md:py-16 px-4 md:px-20 font-inter"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-left space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Smart attendance tracking for <br />
              <span className="text-purple-600">modern institutions. </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl">
              A smart, seamless, and powerful platform designed to deliver high-value 
              attendance management with ease and scalability for educational institutions.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                Sign up
              </button>
              <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200">
                Request a demo
              </button>
            </div>
          </div>

          {/* Right Content - Hero Image with Floating Elements */}
          <div className="lg:w-1/2 relative">
            {/* Background Circle */}
            <div className="absolute inset-0 bg-purple-200/30 rounded-full blur-3xl"></div>

            {/* Main Hero Image */}
            <div className="relative flex justify-center">
              <img
                src="/HeroImage.png"
                alt="Student using AttendAI"
                className="object-cover w-3/4"
              />
            </div>

            {/* Floating UI Elements */}
            {/* Top Left Card */}
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-xl font-bold text-gray-900">12,768</p>
                </div>
              </div>
            </div>

            {/* Top Right Card */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Courses</p>
                  <p className="text-xl font-bold text-gray-900">108</p>
                </div>
              </div>
            </div>

            {/* Bottom Left Card */}
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-xl font-bold text-gray-900">90%</p>
                </div>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Check-ins</p>
                  <p className="text-xl font-bold text-gray-900">2,847 <span className="text-xs text-blue-500 ml-1 align-middle">Live</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos Section */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-8">Trusted by leading educational institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-600 font-semibold">Harvard University</div>
            <div className="text-gray-600 font-semibold">MIT</div>
            <div className="text-gray-600 font-semibold">Stanford</div>
            <div className="text-gray-600 font-semibold">Yale</div>
            <div className="text-gray-600 font-semibold">Princeton</div>
            <div className="text-gray-600 font-semibold">Columbia</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;