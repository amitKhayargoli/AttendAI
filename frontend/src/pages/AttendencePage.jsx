import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import Sidebar from "../AdminSidebar";

const AttendencePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
  .from("detailed_attendance_view")
  .select("*")
  .order("date", { ascending: false });

    if (error) {
      console.error("Failed to fetch attendance data:", error.message);
      setError("Failed to load attendance.");
    } else {
      const parsed = data.map((item, index) => ({
        no: String(index + 1).padStart(2, "0"),
        student: item.student_name,
        subject: item.subject_name,
        course: item.course_name,
        date: new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: item.status === "present" ? "Present" : "Absent",
      }));
      
      setAttendance(parsed);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="max-w-6xl mx-2 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Attendance</h1>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" />
            Fetching attendance...
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.no}>
                    <td className="px-6 py-4 text-sm">{record.no}</td>
                    <td className="px-6 py-4 text-sm">{record.student}</td>
                    <td className="px-6 py-4 text-sm">{record.course}</td>
                    <td className="px-6 py-4 text-sm">{record.subject}</td>
                    <td className="px-6 py-4 text-sm">{record.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                          record.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendencePage;
