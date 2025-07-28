import React from "react";
import { Search, Smartphone } from "lucide-react";

const LandingFeatures = () => {
  return (
    <div
      id="landing-features"
      className="py-12 px-4 md:px-12 lg:px-20 bg-white font-inter"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          {/* Green Banner */}
          <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg mb-4">
            <span className="text-sm font-medium">Features</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Smart. Efficient. Effortless.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Built for modern institutions.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
          {/* Left Card: Face Recognition Based Attendance */}
          <div className="bg-[#9886FE] rounded-3xl shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6 text-white" />
                <h3 className="text-lg md:text-xl font-bold text-white">
                  Face Recognition Based Attendance
                </h3>
              </div>
            </div>
            <div className="p-4 md:p-6 flex justify-center flex-1">
              <img
                src={"/attendance.png"}
                alt="attendance Interface"
                className="w-70 h-60 max-w-xs sm:max-w-sm md:max-w-md h-40 sm:h-52 md:h-60 object-cover rounded-3xl"
              />
            </div>
          </div>

          {/* Right Card: Mobile & Web Access */}
          <div className="bg-[#FFD86F] rounded-3xl shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-black" />
                <h3 className="text-lg md:text-xl font-bold text-black">
                  Mobile & Web Access
                </h3>
              </div>
            </div>

            {/* Mweb Image */}
            <div className="p-4 md:p-6 flex justify-center flex-1">
              <img
                src={"/mweb.png"}
                alt="Mobile & Web Access Interface"
                className="w-70 h-60 max-w-xs sm:max-w-sm md:max-w-md h-40 sm:h-52 md:h-60 object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Calendar Sync Section */}
        <div className="bg-green-200 rounded-2xl md:rounded-3xl w-full flex flex-col md:flex-row items-center">
          <div className="w-full flex flex-col md:flex-row items-center p-6 md:p-8 gap-6 md:gap-8">
            {/* Left Side: Text and App Mockup */}
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Sync Attendance according to your calendar
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
                Now make everyday attendance easy.
              </p>
            </div>

            {/* Right Side: Calendar Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <img
                src={"/calender.png"}
                alt="Calendar Interface"
                className="w-full h-70 max-w-xs sm:max-w-sm md:max-w-md h-40 sm:h-52 md:h-60 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFeatures;
