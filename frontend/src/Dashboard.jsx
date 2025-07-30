import React from "react";
import Sidebar from "./components/StudentSidebar";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarImage } from "./components/ui/avatar";

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
        <nav className="flex py-5 w-full justify-between items-center px-5 bg-white">


          <div><h1 className="text-xl font-medium text-black">Dashboard</h1></div>
          <div className="flex gap-2">
            <img src="image.png" width={30} height={30} alt="" />
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
