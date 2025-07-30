import { Calendar, Settings, X } from "lucide-react";
import React, { useState } from "react";

const DashboardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 13L17 9M14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 12C6 8.68629 8.68629 6 12 6C13.0929 6 14.1175 6.29218 15 6.80269"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M2.5 12.0001C2.5 7.52172 2.5 5.28255 3.89124 3.8913C5.28249 2.50006 7.52166 2.50006 12 2.50006C16.4783 2.50006 18.7175 2.50006 20.1087 3.8913C21.5 5.28255 21.5 7.52172 21.5 12.0001C21.5 16.4784 21.5 18.7176 20.1087 20.1088C18.7175 21.5001 16.4783 21.5001 12 21.5001C7.52166 21.5001 5.28249 21.5001 3.89124 20.1088C2.5 18.7176 2.5 16.4784 2.5 12.0001Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const AttendanceIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.5 13V10C19.5 6.70017 19.5 5.05025 18.4749 4.02513C17.4497 3 15.7998 3 12.5 3H9.5C6.20017 3 4.55025 3 3.52513 4.02513C2.5 5.05025 2.5 6.70017 2.5 10V15C2.5 18.2998 2.5 19.9497 3.52513 20.9749C4.55025 22 6.20017 22 9.5 22H11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 2V4M11 2V4M6 2V4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 20C13.5 20 14.5 20 15.5 22C15.5 22 18.6765 17 21.5 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 15H11M7 10H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const StudentSidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <>
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-55"
        } py-5 px-5 transition-all duration-300 ease-in-out bg-white`}
      >
        <span className="flex justify-between items-center h-10 mb-5">
          <h1
            className={`text-[#9886FE] font-bold text-xl ml-5 ${
              sidebarCollapsed ? "hidden" : "block"
            }`}
          >
            AttendAI
          </h1>
          <button
            onClick={toggleSidebar}
            className="hover:bg-gray-100 p-1 rounded"
          >
            <X
              className={`${
                sidebarCollapsed ? "rotate-180" : ""
              } transition-transform duration-300`}
            />
          </button>
        </span>

        <ul className="flex flex-col gap-4">
          <SidebarItem
            icon={<DashboardIcon />}
            label="Dashboard"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Dashboard"}
            onClick={() => handleTabClick("Dashboard")}
          />
          <SidebarItem
            icon={<AttendanceIcon />}
            label="Attendance"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Attendance"}
            onClick={() => handleTabClick("Attendance")}
          />
          <SidebarItem
            icon={<Settings />}
            label="Settings"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Settings"}
            onClick={() => handleTabClick("Settings")}
          />
        </ul>
      </div>
    </>
  );
};

const SidebarItem = ({ icon, label, collapsed, isActive, onClick }) => {
  return (
    <div
      className={`flex items-center gap-1 px-4 py-2 rounded cursor-pointer transition-all duration-200 ${
        collapsed ? "justify-center" : "justify-start"
      } ${
        isActive
          ? "bg-[#9886FE] text-black rounded-[12px]"
          : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-5 h-5">{icon}</div>
      <h1
        className={`${
          collapsed ? "hidden" : "block"
        } transition-opacity duration-200 font-medium text-[17px] leading-[22px]`}
      >
        {label}
      </h1>
    </div>
  );
};

export default StudentSidebar;
