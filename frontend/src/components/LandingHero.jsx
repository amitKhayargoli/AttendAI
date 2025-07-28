import React from "react";

const LandingHero = () => {
  return (
    <div
      id="hero-section"
      className="bg-gradient-to-r from-[#fffcea] to-white py-8 md:py-16 px-4 md:px-20 font-inter"
    >
      <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-200 max-w-4xl mx-auto text-center rounded-lg p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          Smart attendance tracking <br className="hidden sm:block" />
          <span className="text-black">for modern institutions.</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
          Seamlessly monitor and manage attendance with face recognition – fast,
          secure, and hassle-free.
        </p>
        <div className="relative mt-8 md:mt-12">
          <div className="rounded-xl shadow-xl border overflow-hidden max-w-6xl mx-auto">
            <img
              src={"/Dashboard.png"}
              alt="AttendAI Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
