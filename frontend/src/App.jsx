import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Resetpassword from "./pages/Resetpassword";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/LandingPage";
import StartAtt from "./pages/StartAtt";
import AttendancePage from "./pages/AttendencePage";
import Settings from "./pages/Settings";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Subjects from "./pages/Subjects";
import Classes from "./pages/Classes";
import ClassTimeline from "./pages/ClassTimeline";
import AttendanceSession from "./pages/AttendanceSession";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAttendance from "./pages/StudentAttendance";
import FaceRegistration from "./pages/FaceRegistration";
// import AttendanceModal from "./components/AttendanceModal";
import { useState } from "react";
import Courses from "./pages/Courses";


function App() {
  const [userRole, setUserRole] = useState("Student");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/start" element={<StartAtt />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reset-password" element={<Resetpassword />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/face-registration" element={<FaceRegistration />} />
        {/* <Route path="/attendance-modal" element={<AttendanceModalTest />} /> */}
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/class-timeline" element={<ClassTimeline />} />
        <Route path="/attendance-session" element={<AttendanceSession />} />
      </Routes>
    </Router>
  );
}

export default App;
