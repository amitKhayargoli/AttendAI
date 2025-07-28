import React from "react";
import { Eye, Target, Clock, Phone, Video } from "lucide-react";

const LandingEdge = () => {
  return (
    <div id="Edge-section" className="py-16 px-4 md:px-20 bg-white font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Small Banner */}
          <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-lg transform rotate-1 mb-4">
            <span className="text-sm font-medium">Why choose us</span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What makes us different
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Next-level attendance tracking with unmatched accuracy, speed, and
            ease of use.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Real-time Monitoring */}
          <div className="bg-gray-200 rounded-xl shadow-lg p-6 border">
            {/* Icon */}
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Real-time Monitoring
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Live updates and alerts for absences or unauthorized access.
            </p>

            {/* Realtime Image */}
            <div className="rounded-lg overflow-hidden flex justify-center">
              <img
                src={"/realtime.png"}
                alt="Real-time Monitoring Interface"
                className="w-35 h-35 object-cover"
              />
            </div>
          </div>

          {/* Card 2: Accurate & Reliable */}
          <div className="bg-gray-200 rounded-xl shadow-lg p-6 border">
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Accurate & Reliable
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Reduces chances of proxy attendance or buddy punching.
            </p>

            {/* Reliable Image */}
            <div className="rounded-lg overflow-hidden flex justify-center">
              <img
                src={"/reliable.png"}
                alt="Accurate & Reliable Interface"
                className="w-35 h-35 object-cover"
              />
            </div>
          </div>

          {/* Card 3: Time Efficient */}
          <div className="bg-gray-200 rounded-xl shadow-lg p-6 border">
            {/* Icon */}
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Time Efficient
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Speeds up check-in and check-out processes.
            </p>
            <div className="rounded-lg overflow-hidden flex justify-center">
              <img
                src={"/time.png"}
                alt="Time Efficient Interface"
                className="w-35 h-35 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingEdge;
