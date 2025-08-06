import React from "react";
import { Bell, Shield, Clock } from "lucide-react";

const features = [
  {
    title: "Real-time Updates",
    description: "Get instant updates when students miss classes or check in late.",
    icon: Bell,
    iconBg: "bg-yellow-500",
    metric: "92%",
    metricTitle: "Live Attendance",
    submetrics: ["Checked In", "Late", "Absent"],
    avatarGroup: [
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/56.jpg",
      "https://randomuser.me/api/portraits/women/67.jpg"
    ]
  },
  {
    title: "Proxy Prevention",
    description: "Face recognition prevents buddy check-ins and ensures identity accuracy.",
    icon: Shield,
    iconBg: "bg-blue-500",
    metric: "98%",
    metricTitle: "Verified Check-ins",
    submetrics: ["Face Match", "Manual", "Flagged"],
    avatarGroup: [
      "https://randomuser.me/api/portraits/women/82.jpg",
      "https://randomuser.me/api/portraits/men/99.jpg",
      "https://randomuser.me/api/portraits/women/11.jpg",
      "https://randomuser.me/api/portraits/men/65.jpg"
    ]
  },
  {
    title: "Time Efficiency",
    description: "Students can check in within 3 seconds using the mobile app or QR code.",
    icon: Clock,
    iconBg: "bg-purple-500",
    metric: "3s",
    metricTitle: "Face recognition",
    submetrics: ["QR Code", "Face ID", "Manual"],
    avatarGroup: [] // No avatars for this one
  }
];

const LandingFeatures = () => {
  return (
    <div id="Features-section" className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-purple-100 py-20 px-4 md:px-20 font-inter">
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

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div key={idx} className="bg-linear-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border">
                {/* Icon */}
                <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">{feature.description}</p>

                {/* Metric Card */}
                <div className="rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">{feature.metricTitle}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    {feature.avatarGroup.length > 0 ? (
                      <div className="flex -space-x-2">
                        {feature.avatarGroup.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Student ${i + 1}`}
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center">

                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <h1></h1>
                      </div>
                      <h1 className="text-sm text-gray-500 ">Avg. Check-in Time</h1>

                      </div>
                    )}
                    <span className="text-lg font-bold text-purple-600">{feature.metric}</span>
                  </div>


                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingFeatures;