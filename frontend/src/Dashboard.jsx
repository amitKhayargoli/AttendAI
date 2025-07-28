import React from "react";
import Sidebar from "./Sidebar";
import { ChevronDown } from "lucide-react";

const Dashboard = () => {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          // "conic-gradient(from 180deg at 50% 50%, #FDBD16 0deg, #FFFFFF 138.46deg, #FDBD16 360deg)",
          "#F4F4F4",
      }}
    >
      <Sidebar />

      <div className="flex flex-col flex-2">
        <nav className="flex py-5 w-full  justify-end">
          <div className="flex gap-2">
            <img src="image.png" width={50} height={50} alt="" />
          </div>
        </nav>

        <div className="flex px-6 ">
          <span className="flex gap-2 items-center">
            <h1 className="text-2xl font-bold text-black">
              {" "}
              Welcome Back, Amit
            </h1>
            <img
              src="wave.png"
              width={40}
              height={40}
              alt=""
              className="mb-3"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
