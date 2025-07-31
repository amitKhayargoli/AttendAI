import { Settings, X, Users, BookOpen, FileText, BarChart3, Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const ManageStudentsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20">
        <defs>
            <clipPath id="clipPath3520316110">
                <path d="M0 0L20 0L20 20L0 20L0 0Z" fill-rule="nonzero" transform="matrix(1 0 0 1 0 0)"/>
            </clipPath>
        </defs>
        <g clip-path="url(#clipPath3520316110)">
            <path d="M5.78787 2.85741Q5.73821 3.54668 5.46748 4.17087Q5.20584 4.77411 4.77194 5.24031Q4.33332 5.71159 3.78403 5.97322Q3.20293 6.25 2.58636 6.25Q1.96983 6.25 1.38857 5.97335Q0.838958 5.71176 0.400173 5.2406Q-0.0341398 4.77423 -0.295649 4.17089Q-0.566382 3.54627 -0.615206 2.85664Q-0.667164 2.12385 -0.448182 1.47574Q-0.232906 0.838596 0.216952 0.358927Q0.661748 -0.115345 1.27389 -0.370016Q1.88679 -0.625 2.58636 -0.625Q3.28648 -0.625 3.90238 -0.364292Q4.51248 -0.106042 4.95737 0.371924Q5.4054 0.853262 5.62065 1.48768Q5.84008 2.13444 5.78786 2.85752L5.78787 2.85741ZM4.54111 2.76748Q4.60867 1.83195 4.0424 1.22358Q3.48524 0.625 2.58636 0.625Q1.68113 0.625 1.12871 1.21402Q0.564146 1.816 0.631673 2.76836Q0.699611 3.72798 1.31493 4.3887Q1.88422 5 2.58636 5Q3.28798 5 3.85693 4.3887Q4.47191 3.72792 4.5411 2.76759L4.54111 2.76748Z" fill-rule="nonzero" transform="matrix(1 0 0 1 10.5386 3.75)" fill="black"/>
            <path d="M5.62485 0.625Q4.73942 0.625 3.91998 0.840495Q3.09285 1.05801 2.42588 1.47131Q1.00428 2.35222 0.624288 3.87799Q0.630089 3.85474 0.606974 3.82087Q0.558618 3.75 0.475627 3.75L10.7745 3.75Q10.6909 3.75 10.6424 3.82129Q10.6199 3.85422 10.6253 3.87614Q10.2466 2.33092 8.82605 1.45769Q8.16195 1.04944 7.33288 0.835712Q6.51551 0.625 5.62485 0.625L5.62485 0.625ZM5.62485 -0.625Q6.67404 -0.625 7.64492 -0.374714Q8.65624 -0.114001 9.48067 0.392803Q10.3612 0.934108 10.9526 1.71035Q11.5849 2.54036 11.8392 3.57777Q11.9669 4.0972 11.6755 4.525Q11.5265 4.74378 11.2972 4.86852Q11.0557 5 10.7745 5L0.475627 5Q0.194601 5 -0.046998 4.8687Q-0.276359 4.74405 -0.425546 4.52542Q-0.718424 4.09621 -0.588661 3.57591Q-0.333728 2.55228 0.29821 1.72605Q0.889727 0.952667 1.76746 0.408769Q2.59372 -0.103226 3.60206 -0.368401Q4.5778 -0.625 5.62485 -0.625L5.62485 -0.625Z" fill-rule="nonzero" transform="matrix(1 0 0 1 7.50015 11.875)" fill="black"/>
            <path d="M4.77049 2.30819Q4.72928 2.88015 4.50268 3.40189Q4.28386 3.90571 3.92141 4.29749Q3.55306 4.69563 3.09226 4.91813Q2.59908 5.15625 2.07679 5.15625Q1.55455 5.15625 1.06128 4.91826Q0.600202 4.69582 0.231722 4.29778Q-0.131097 3.90586 -0.349822 3.40191Q-0.576446 2.87976 -0.616963 2.30742Q-0.660173 1.69651 -0.475123 1.15177Q-0.292995 0.615631 0.0862567 0.209886Q0.461679 -0.191761 0.97616 -0.408109Q1.49193 -0.625 2.07679 -0.625Q2.66251 -0.625 3.18098 -0.403194Q3.6936 -0.183888 4.06892 0.220685Q4.44641 0.627598 4.62845 1.16124Q4.81395 1.70504 4.77049 2.3082L4.77049 2.30819ZM3.52372 2.21836Q3.57369 1.5248 3.15253 1.07082Q2.73894 0.625 2.07679 0.625Q1.40928 0.625 0.99945 1.06345Q0.57992 1.51229 0.629917 2.21915Q0.681177 2.94325 1.14901 3.44861Q1.57266 3.90625 2.07679 3.90625Q2.58046 3.90625 3.00385 3.44861Q3.4715 2.94312 3.52372 2.21837L3.52372 2.21836Z" fill-rule="nonzero" transform="matrix(1 0 0 1 3.6654 5)" fill="black"/>
            <path d="M4.49257 0.625Q5.6847 0.625 6.53692 1.01547C6.85073 1.15924 7.22168 1.0214 7.36546 0.707599C7.50923 0.393793 7.3714 0.0228424 7.05759 -0.120934Q5.95742 -0.625 4.49257 -0.625Q2.70953 -0.625 1.34631 0.219406Q0.625403 0.665956 0.138686 1.30186Q-0.382304 1.98255 -0.592391 2.8254Q-0.709084 3.29641 -0.44342 3.6854Q-0.307128 3.88496 -0.0973984 3.99897Q0.123674 4.11914 0.38007 4.11914L4.76601 4.11914C5.11118 4.11914 5.39101 3.83932 5.39101 3.49414C5.39101 3.14897 5.11118 2.86914 4.76601 2.86914L0.696818 2.86914Q1.03566 1.88221 2.00455 1.28206Q3.06531 0.625 4.49257 0.625Z" fill-rule="evenodd" transform="matrix(1 0 0 1 1.24962 11.5059)" fill="black"/>
        </g>
    </svg>
    
);

const AdminSidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Try to get the collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname;
    switch (path) {
      case "/admin": return "Dashboard";
      case "/students": return "Students";
      case "/teachers": return "Teachers";
      case "/subjects": return "Subjects";
      case "/classes": return "Classes";
      case "/attendance": return "Attendance";
      case "/settings": return "Settings";
      default: return "Dashboard";
    }
  });
  const navigate = useNavigate();

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    
    // Handle navigation based on tab name
    switch (tabName) {
      case "Dashboard":
        navigate("/admin");
        break;
      case "Students":
        navigate("/students");
        break;
      case "Teachers":
        navigate("/teachers");
        break;
      case "Subjects":
        navigate("/subjects");
        break;
      case "Classes":
        navigate("/classes");
        break;
      case "Attendance":
        navigate("/attendance");
        break;
      case "Settings":
        navigate("/settings");
        break;
      default:
        break;
    }
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
            icon={<ManageStudentsIcon />}
            label="Students"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Students"}
            onClick={() => handleTabClick("Students")}
          />
          <SidebarItem
            icon={<Users />}
            label="Teachers"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Teachers"}
            onClick={() => handleTabClick("Teachers")}
          />
          <SidebarItem
            icon={<BookOpen />}
            label="Subjects"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Subjects"}
            onClick={() => handleTabClick("Subjects")}
          />
          <SidebarItem
            icon={<Calendar />}
            label="Classes"
            collapsed={sidebarCollapsed}
            isActive={activeTab === "Classes"}
            onClick={() => handleTabClick("Classes")}
          />
          <SidebarItem
            icon={<BarChart3 />}
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

export default AdminSidebar; 