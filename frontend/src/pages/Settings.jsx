import React, { useState } from "react";

export default function Settings() {
  const [fullName, setFullName] = useState("John Doe");
  const [role] = useState("Student");
  const [institutionalEmail] = useState("john.doe@university.edu");
  const [recoveryEmail, setRecoveryEmail] = useState("john.doe@personal.com");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Simple password strength check
  const getPasswordStrength = (password) => {
    if (password.length > 8) return "Strong";
    if (password.length > 4) return "Medium";
    return "Weak";
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          {/* App Icon */}
          <span className="material-icons text-[#9886FE]">school</span>
          <span className="font-bold text-lg text-[#9886FE]">AttendAI</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400">
            <span className="material-icons">notifications_none</span>
          </button>
          <span className="text-black text-sm">John Doe</span>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex gap-8 px-8 pt-6 border-b bg-white">
        <button className="pb-2 border-b-2 border-[#9886FE] text-[#9886FE] font-medium flex items-center gap-1">
          <span className="material-icons text-[#9886FE] text-base">
            person
          </span>
          Profile
        </button>
        <button className="pb-2 text-gray-500 font-medium flex items-center gap-1">
          <span className="material-icons text-gray-400 text-base">
            security
          </span>
          Security
        </button>
        <button className="pb-2 text-gray-500 font-medium flex items-center gap-1">
          <span className="material-icons text-gray-400 text-base">
            notifications
          </span>
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
          <button className="text-[#9886FE] text-sm mt-2 flex items-center gap-1">
            <span className="material-icons text-[#9886FE] text-base">
              edit
            </span>
            Edit Name
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
            <button className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm flex items-center gap-1">
              <span className="material-icons text-white text-base">save</span>
              Save Changes
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-green-500 text-base">
              check_circle
            </span>
            <span className="text-green-600 text-sm">Verified</span>
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
            <button className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm flex items-center gap-1">
              <span className="material-icons text-white text-base">add</span>
              Add Phone
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-gray-400 text-base">
              cancel
            </span>
            <span className="text-gray-500 text-sm">Unverified</span>
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
          <button className="bg-[#9886FE] text-white px-4 py-2 rounded text-sm mt-2 flex items-center gap-1">
            <span className="material-icons text-white text-base">
              lock_reset
            </span>
            Update Password
          </button>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <span className="material-icons text-[#9886FE]">devices</span>
            Active Sessions
          </h2>
          <div className="flex items-center justify-between border rounded px-3 py-2 bg-gray-50 mb-2">
            <div className="flex items-center gap-2">
              <span className="material-icons text-gray-400">laptop_mac</span>
              <span className="text-sm text-black">MacBook Pro - Chrome</span>
              <span className="text-xs text-gray-500 ml-2">
                Last active: Just now
              </span>
            </div>
            <span className="text-green-500 text-xs font-medium">
              Current Device
            </span>
          </div>
          <button className="border border-red-400 text-red-500 px-4 py-2 rounded text-sm flex items-center gap-1">
            <span className="material-icons text-red-400 text-base">
              logout
            </span>
            Log out of all devices
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow p-6 border border-red-400 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-icons text-red-400">warning</span>
            <span className="font-semibold text-red-500">Danger Zone</span>
          </div>
          <span className="text-sm text-gray-500">
            Once you delete your account, there is no going back. Please be
            certain.
          </span>
          <button className="bg-red-500 text-white px-4 py-2 rounded text-sm w-fit flex items-center gap-1">
            <span className="material-icons text-white text-base">delete</span>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
