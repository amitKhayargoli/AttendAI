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
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/LandingPage";
import StartAtt from "./pages/StartAtt";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/start" element={<StartAtt />} />
      </Routes>
    </Router>
  );
}

export default App;
