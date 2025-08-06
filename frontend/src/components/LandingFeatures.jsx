import React from "react";
import { Eye, Smartphone, Calendar, Shield, Zap, Users, CheckCircle } from "lucide-react";

const LandingFeatures = () => {
  return (
    <div
      id="landing-features"
      className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-purple-100 py-20 px-4 md:px-20 font-inter"
    >
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

        

 
      </div>
    </div>
  );
};

export default LandingFeatures;