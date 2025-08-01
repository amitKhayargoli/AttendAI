import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Resetpassword from "./pages/Resetpassword";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Subjects from "./pages/Subjects";
import Classes from "./pages/Classes";
import ClassTimeline from "./pages/ClassTimeline";
import AttendanceSession from "./pages/AttendanceSession";
import { useState } from "react";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const [userRole, setUserRole] = useState("Student");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/class-timeline" element={<ClassTimeline />} />
        <Route path="/attendance-session" element={<AttendanceSession />} />
      </Routes>
    </Router>
  );
}

export default App;
