import AdminSidebar from "@/AdminSidebar";
import React, { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "userProfile";

export default function Settings() {
  const [loading, setLoading] = useState(true);

  // User profile fields
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Student"); // static role
  const [institutionalEmail, setInstitutionalEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password strength helper
  const getPasswordStrength = (password) => {
    if (password.length > 8) return "Strong";
    if (password.length > 4) return "Medium";
    return "Weak";
  };

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProfile) {
      try {
        const data = JSON.parse(savedProfile);
        setFullName(data.fullName || "");
        setRole(data.role || "Student");
        setInstitutionalEmail(data.institutionalEmail || "");
        setRecoveryEmail(data.recoveryEmail || "");
        setPhone(data.phone || "");
      } catch {
        // ignore parse error, keep empty
      }
    } else {
      // initialize with some dummy data on first load
      const initial = {
        fullName: "Amit Khayargoli",
        role: "Admin",
        institutionalEmail: "admin@softwarica.edu.np",
        recoveryEmail: "aggoli16@gmail.com",
        phone: "9849104490",
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      setFullName(initial.fullName);
      setRole(initial.role);
      setInstitutionalEmail(initial.institutionalEmail);
      setRecoveryEmail(initial.recoveryEmail);
      setPhone(initial.phone);
    }
    setLoading(false);
  }, []);

  // Helper to save current profile to localStorage
  const saveProfileToLocalStorage = (updates) => {
    const currentProfile = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    const newProfile = { ...currentProfile, ...updates };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
  };

  const updateFullName = () => {
    saveProfileToLocalStorage({ fullName });
    alert("Full name updated successfully!");
  };

  const updateRecoveryEmail = () => {
    saveProfileToLocalStorage({ recoveryEmail });
    alert("Recovery email updated successfully!");
  };

  const updatePhone = () => {
    saveProfileToLocalStorage({ phone });
    alert("Phone number updated successfully!");
  };

  const updatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    if (getPasswordStrength(newPassword) === "Weak") {
      alert("Password strength is weak. Please choose a stronger password.");
      return;
    }
    alert("Password updated successfully! (not really, this is a demo)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="bg-[#F8F9FA] min-h-screen w-full">
        {/* Top Bar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#9886FE]">AttendAI</span>
          </div>
          <div className="flex items-center gap-4">
            <img
              src="image.png"
              alt="profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </nav>

        {/* Tabs */}
        <div className="flex gap-8 px-8 pt-6 border-b bg-white">
          <button className="pb-2 border-b-2 border-[#9886FE] text-[#9886FE] font-medium flex items-center gap-1">
            <span className="material-icons text-[#9886FE] text-base">person</span>
            Profile
          </button>
          <button className="pb-2 text-gray-500 font-medium flex items-center gap-1">
            <span className="material-icons text-gray-400 text-base">security</span>
            Security
          </button>
          <button className="pb-2 text-gray-500 font-medium flex items-center gap-1">
            <span className="material-icons text-gray-400 text-base">notifications</span>
            Notifications
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto py-8 flex flex-col gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="material-icons text-[#9886FE]">person</span>
              Personal Information
            </h2>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              className="border rounded px-3 py-2 mb-2 bg-gray-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <label className="text-sm text-gray-600">Role</label>
            <input
              type="text"
              className="border rounded px-3 py-2 mb-2 bg-gray-50"
              value={role}
              disabled
            />
            <label className="text-sm text-gray-600">Institutional Email</label>
            <input
              type="email"
              className="border rounded px-3 py-2 mb-2 bg-gray-50"
              value={institutionalEmail}
              disabled
            />
            <button
              onClick={updateFullName}
              className="text-[#9886FE] text-sm mt-2 flex items-center gap-1"
            >
              <span className="material-icons text-[#9886FE] text-base">edit</span>
              Save Name
            </button>
          </div>

          {/* Security & Recovery */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="material-icons text-[#9886FE]">lock</span>
              Security & Recovery
            </h2>
            <label className="text-sm text-gray-600">Recovery Email</label>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="email"
                className="border rounded px-3 py-2 bg-gray-50 flex-1"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              <button
                onClick={updateRecoveryEmail}
                className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm flex items-center gap-1"
              >
                <span className="material-icons text-white text-base">save</span>
                Save Changes
              </button>
            </div>

            <label className="text-sm text-gray-600">Phone Number</label>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                className="border rounded px-3 py-2 bg-gray-50 flex-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
              <button
                onClick={updatePhone}
                className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm flex items-center gap-1"
              >
                <span className="material-icons text-white text-base">add</span>
                Add Phone
              </button>
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="material-icons text-[#9886FE]">vpn_key</span>
              Password Management
            </h2>
            <label className="text-sm text-gray-600">Current Password</label>
            <div className="relative">
              <input
                type="password"
                className="border rounded px-3 py-2 mb-2 bg-gray-50 w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <span className="material-icons absolute right-2 top-2 text-gray-400 cursor-pointer text-base">
                visibility_off
              </span>
            </div>
            <label className="text-sm text-gray-600">New Password</label>
            <div className="relative">
              <input
                type="password"
                className="border rounded px-3 py-2 mb-2 bg-gray-50 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span className="material-icons absolute right-2 top-2 text-gray-400 cursor-pointer text-base">
                visibility_off
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Password strength: {getPasswordStrength(newPassword)}
              <div className="w-full h-1 bg-gray-200 rounded mt-1">
                <div
                  className={
                    "h-1 rounded " +
                    (getPasswordStrength(newPassword) === "Strong"
                      ? "bg-green-400 w-full"
                      : getPasswordStrength(newPassword) === "Medium"
                      ? "bg-yellow-400 w-2/3"
                      : "bg-red-400 w-1/3")
                  }
                ></div>
              </div>
            </div>
            <label className="text-sm text-gray-600">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                className="border rounded px-3 py-2 mb-2 bg-gray-50 w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="material-icons absolute right-2 top-2 text-gray-400 cursor-pointer text-base">
                visibility_off
              </span>
            </div>
            <button
              onClick={updatePassword}
              className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm mt-2 flex items-center gap-1"
            >
              <span className="material-icons text-white text-base">lock_reset</span>
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
