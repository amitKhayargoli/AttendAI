import React from "react";
import Sidebar from "../components/StudentSidebar";

const attendanceData = [
  {
    no: "01",
    student: "Amit Khayargoli",
    subject: "English",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "02",
    student: "Amit Khayargoli",
    subject: "Maths",
    date: "12 May 2024",
    status: "Absent",
  },
  {
    no: "03",
    student: "Asrim Suwal",
    subject: "Physics",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "04",
    student: "Asrim Suwal",
    subject: "Chemistry",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "05",
    student: "Aryan Nakarmi",
    subject: "English",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "06",
    student: "Asrim Suwal",
    subject: "EVS",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "07",
    student: "Asrim Suwal",
    subject: "Math",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "08",
    student: "Asrim Suwal",
    subject: "History",
    date: "12 May 2024",
    status: "Present",
  },
  {
    no: "09",
    student: "Asrim Suwal",
    subject: "Architecture",
    date: "12 May 2024",
    status: "Present",
  },
];

export default function AttendencePage() {
  return (
    <div className="min-h-screen flex bg-[#EDEDE8]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-12 py-8">
          <h1 className="text-4xl font-bold text-black">Attendance</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-black">Amit K</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Amit K"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        </div>
        <div className="flex justify-center items-start flex-1">
          <div className="bg-white rounded-2xl shadow p-6 w-full max-w-4xl mt-4 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Attendance</span>
              <div className="flex items-center gap-2">
                <svg
                  className="text-gray-400"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Subject"
                  className="bg-[#F7F7F7] rounded px-3 py-1 text-sm outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 rounded-tl-xl text-left">
                      No
                    </th>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 text-left">
                      Student
                    </th>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 text-left">
                      Subject
                    </th>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 text-left">
                      Date
                    </th>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 text-left">
                      Attendance
                    </th>
                    <th className="bg-[#9886FE] text-white font-medium py-3 px-4 rounded-tr-xl text-left">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((row, idx) => (
                    <tr
                      key={row.no}
                      className="border-b last:border-b-0"
                      style={{
                        borderBottom:
                          idx === attendanceData.length - 1
                            ? "none"
                            : "1px solid #2222",
                      }}
                    >
                      <td className="py-3 px-4">{row.no}</td>
                      <td className="py-3 px-4">{row.student}</td>
                      <td className="py-3 px-4">{row.subject}</td>
                      <td className="py-3 px-4">{row.date}</td>
                      <td className="py-3 px-4">
                        {row.status === "Present" ? (
                          <span className="bg-lime-300 text-black px-4 py-1 rounded-full text-xs font-semibold">
                            Present
                          </span>
                        ) : (
                          <span className="bg-red-400 text-white px-4 py-1 rounded-full text-xs font-semibold">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
