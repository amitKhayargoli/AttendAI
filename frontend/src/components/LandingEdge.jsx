import React from "react";
import { Shield, Zap, Users, GraduationCap, BookOpen, Award } from "lucide-react";

const LandingEdge = () => {
  return (
    <div id="Edge-section" className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-purple-100 py-20 px-4 md:px-20 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-block bg-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-8">
            Core Features
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
            Smart. Efficient. <span className="text-purple-600">Effortless.</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Built for modern educational institutions with cutting-edge technology 
            that transforms attendance management.
          </p>
        </div>

        {/* Main Feature Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Feature Details */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Privacy-First Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Student data protection is our priority. All facial recognition data is encrypted 
                  and processed locally, ensuring complete privacy compliance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Instant recognition and attendance marking. No more waiting in long queues 
                  or manual roll calls. Students can check in within seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Scalable Solution</h3>
                <p className="text-gray-600 leading-relaxed">
                  From small classrooms to large universities. Our system scales seamlessly 
                  to handle thousands of students across multiple campuses.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Main Image */}
          <div className="relative ">
            <div className="bg-linear-to-b from-purple-50 to bg-purple-100 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <img
                src={"/herosection.png"}
                alt="AttendAI Dashboard Interface"
                className="w-full h-auto"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default LandingEdge;