import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import TeacherNavbar from "@/components/TeacherNavbar";

const ManageAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

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
        id: item.attendance_id,
        no: String(index + 1).padStart(2, "0"),
        student: item.student_name,
        course: item.course_name,
        subject: item.subject_name,
        date: new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: item.status === "present" ? "Present" : "Absent",
      }));

      setAttendance(parsed);
      setFilteredAttendance(parsed);

      // Extract unique courses and subjects for filters
      setCourses([...new Set(parsed.map((item) => item.course))]);
      setSubjects([...new Set(parsed.map((item) => item.subject))]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = attendance;

    if (selectedCourse) {
      filtered = filtered.filter((a) => a.course === selectedCourse);
    }

    if (selectedSubject) {
      filtered = filtered.filter((a) => a.subject === selectedSubject);
    }

    setFilteredAttendance(filtered);
  }, [selectedCourse, selectedSubject, attendance]);

  const toggleAttendance = async (record) => {
    const newStatus = record.status === "Present" ? "Absent" : "Present";
    setUpdatingId(record.id);

    const { error } = await supabase
      .from("class_attendance")
      .update({ status: newStatus.toLowerCase() })
      .eq("id", record.id);

    if (error) {
      console.error("Failed to update attendance:", error.message);
      setError("Failed to update attendance.");
    } else {
      setAttendance((prev) =>
        prev.map((r) =>
          r.id === record.id ? { ...r, status: newStatus } : r
        )
      );
    }

    setUpdatingId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <TeacherNavbar />
      <div className="max-w-6xl mx-2 p-6 overflow-auto flex flex-col flex-1">
        <h1 className="text-3xl font-bold mb-6">Attendance</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            className="border rounded px-3 py-2"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" />
            Fetching attendance...
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : filteredAttendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto border rounded-xl flex-grow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map((record, idx) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 text-sm">{String(idx + 1).padStart(2, "0")}</td>
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
                    <td className="px-20 py-4 text-sm">
                      <input
                        type="checkbox"
                        checked={record.status === "Present"}
                        onChange={() => toggleAttendance(record)}
                        disabled={updatingId === record.id}
                        className="w-4 h-4 cursor-pointer"
                      />
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

export default ManageAttendance;
