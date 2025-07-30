import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import { useState } from "react";

function App() {
  const [userRole, setUserRole] = useState("Student");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/students" element={<Students />} />
      </Routes>
    </Router>
  );
}

export default App;
