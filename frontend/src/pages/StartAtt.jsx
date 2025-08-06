import React, { useState } from "react";

const students = [
  {
    name: "Emma Thompson",
    email: "emma.t@school.edu",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    marked: false,
  },
  {
    name: "James Wilson",
    email: "james.w@school.edu",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    marked: false,
  },
  {
    name: "Sophia Chen",
    email: "sophia.c@school.edu",
    avatar: "https://randomuser.me/api/portraits/women/46.jpg",
    marked: false,
  },
  {
    name: "Lucas Garcia",
    email: "lucas.g@school.edu",
    avatar: "https://randomuser.me/api/portraits/men/47.jpg",
    marked: false,
  },
  {
    name: "Olivia Brown",
    email: "olivia.b@school.edu",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    marked: false,
  },
  {
    name: "William Taylor",
    email: "william.t@school.edu",
    avatar: "https://randomuser.me/api/portraits/men/48.jpg",
    marked: false,
  },
];

export default function StartAtt() {
  const [sessionActive, setSessionActive] = useState(false);
  const [markedStudents, setMarkedStudents] = useState([]);
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const handleStart = () => setSessionActive(true);
  const handleEnd = () => {
    setSessionActive(false);
    setMarkedStudents([]);
  };

  const handleMark = (email) => {
    if (!markedStudents.includes(email)) {
      setMarkedStudents([...markedStudents, email]);
    }
  };

  const presentCount = markedStudents.length;
  const absentCount = students.length - presentCount;

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen p-6">
      {/* Class Info */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Advanced Mathematics 101
          </h2>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                className="inline"
              >
                <circle cx="9" cy="9" r="8" strokeWidth="2" />
                <path d="M9 5v4l2 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              10:30 AM - 12:00 PM
            </span>
            <span className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                className="inline"
              >
                <rect
                  x="3"
                  y="7"
                  width="12"
                  height="8"
                  rx="2"
                  strokeWidth="2"
                />
                <path d="M7 3h4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Room 305
            </span>
            <span className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                className="inline"
              >
                <path
                  d="M4 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
                  strokeWidth="2"
                />
                <rect
                  x="4"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                  strokeWidth="2"
                />
              </svg>
              Mathematics
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
          <span className="text-gray-500 text-sm">
            Thursday, October 12, 2023
          </span>
          <span className="bg-purple-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Upcoming
          </span>
        </div>
      </div>

      {/* Attendance Session */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4 items-center">
          {!sessionActive ? (
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded transition"
              onClick={handleStart}
            >
              Start Attendance Session
            </button>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 px-5 py-2 rounded font-semibold">
              Session active: {formatTime(timer)}
            </span>
          )}
          <span className="text-blue-600 font-medium">
            Students marked: {presentCount} / {students.length}
          </span>
        </div>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded transition"
          onClick={handleEnd}
          disabled={!sessionActive}
        >
          End Session
        </button>
      </div>

      {/* Enrolled Students */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Enrolled Students</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.email}
              className="flex items-center gap-4 bg-[#F8F9FB] rounded-lg p-4"
            >
              <img
                src={student.avatar}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold">{student.name}</div>
                <div className="text-sm text-gray-500">{student.email}</div>
              </div>
              <div className="flex flex-col items-end">
                <button
                  className={`text-xs font-medium ${
                    markedStudents.includes(student.email)
                      ? "text-green-600"
                      : "text-purple-400"
                  }`}
                  disabled={
                    markedStudents.includes(student.email) || !sessionActive
                  }
                  onClick={() => handleMark(student.email)}
                >
                  {markedStudents.includes(student.email)
                    ? "Marked"
                    : "Not marked"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-gray-600">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            className="inline"
          >
            <circle cx="10" cy="10" r="8" strokeWidth="2" />
            <path d="M10 6v4l2 2" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Total Students: {students.length}
        </span>
        <div className="flex gap-6">
          <span className="flex items-center gap-1 text-green-600">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              className="inline"
            >
              <circle cx="9" cy="9" r="8" strokeWidth="2" />
              <path d="M6 9l2 2 4-4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Present: {presentCount}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              className="inline"
            >
              <circle cx="9" cy="9" r="8" strokeWidth="2" />
              <path d="M6 12l6-6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Absent: {absentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
