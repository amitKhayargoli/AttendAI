import React from "react";
import Sidebar from "../Sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLineDots } from "@/components/ChartLineDots";
import EventCalendarCard from "@/components/EventCalendarCard";

const stats = [
  {
    label: "Total Students",
    value: "2,590",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M0 21C0 16.5817 3.58172 13 8 13C12.4183 13 16 16.5817 16 21L14 21C14 17.6863 11.3137 15 8 15C4.68629 15 2 17.6863 2 21L0 21ZM8 12C4.685 12 2 9.315 2 6C2 2.685 4.685 0 8 0C11.315 0 14 2.685 14 6C14 9.315 11.315 12 8 12ZM8 10C10.21 10 12 8.21 12 6C12 3.79 10.21 2 8 2C5.79 2 4 3.79 4 6C4 8.21 5.79 10 8 10Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "Total Teachers",
    value: "2,590",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M10 9C12.7614 9 15 11.2386 15 14L15 20L13 20L13 14C13 12.4023 11.7511 11.0963 10.1763 11.0051L10 11C8.4023 11 7.09634 12.2489 7.00509 13.8237L7 14L7 20L5 20L5 14C5 11.2386 7.23858 9 10 9ZM3.5 12C3.77885 12 4.05009 12.0326 4.3101 12.0942C4.14202 12.594 4.03873 13.122 4.00896 13.6693L4 14L4.0007 14.0856C3.88757 14.0456 3.76821 14.0187 3.64446 14.0069L3.5 14C2.7203 14 2.07955 14.5949 2.00687 15.3555L2 15.5L2 20L0 20L0 15.5C0 13.567 1.567 12 3.5 12ZM16.5 12C18.433 12 20 13.567 20 15.5L20 20L18 20L18 15.5C18 14.7203 17.4051 14.0796 16.6445 14.0069L16.5 14C16.3248 14 16.1566 14.03 16.0003 14.0852L16 14C16 13.3343 15.8916 12.694 15.6915 12.0956C15.9499 12.0326 16.2211 12 16.5 12ZM3.5 6C4.88071 6 6 7.11929 6 8.5C6 9.8807 4.88071 11 3.5 11C2.11929 11 1 9.8807 1 8.5C1 7.11929 2.11929 6 3.5 6ZM16.5 6C17.8807 6 19 7.11929 19 8.5C19 9.8807 17.8807 11 16.5 11C15.1193 11 14 9.8807 14 8.5C14 7.11929 15.1193 6 16.5 6ZM3.5 8C3.22386 8 3 8.2239 3 8.5C3 8.7761 3.22386 9 3.5 9C3.77614 9 4 8.7761 4 8.5C4 8.2239 3.77614 8 3.5 8ZM16.5 8C16.2239 8 16 8.2239 16 8.5C16 8.7761 16.2239 9 16.5 9C16.7761 9 17 8.7761 17 8.5C17 8.2239 16.7761 8 16.5 8ZM10 0C12.2091 0 14 1.79086 14 4C14 6.20914 12.2091 8 10 8C7.79086 8 6 6.20914 6 4C6 1.79086 7.79086 0 10 0ZM10 2C8.8954 2 8 2.89543 8 4C8 5.10457 8.8954 6 10 6C11.1046 6 12 5.10457 12 4C12 2.89543 11.1046 2 10 2Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "Subjects Offered",
    value: "32",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M11 18L11 20L9 20L9 18L1 18C0.44772 18 0 17.5523 0 17L0 1C0 0.44772 0.44772 0 1 0L7 0C8.1947 0 9.2671 0.52375 10 1.35418C10.7329 0.52375 11.8053 0 13 0L19 0C19.5523 0 20 0.44772 20 1L20 17C20 17.5523 19.5523 18 19 18L11 18ZM18 16L18 2L13 2C11.8954 2 11 2.89543 11 4L11 16L18 16ZM9 16L9 4C9 2.89543 8.1046 2 7 2L2 2L2 16L9 16Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "Monthly Attendance",
    value: "94.7%",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M8 5L10 5L10 15L8 15L8 5ZM12 9L14 9L14 15L12 15L12 9ZM4 11L6 11L6 15L4 15L4 11ZM12 2L2 2L2 18L16 18L16 6L12 6L12 2ZM0 0.9918C0 0.44405 0.44749 0 0.9985 0L13 0L17.9997 5L18 18.9925C18 19.5489 17.5551 20 17.0066 20L0.9934 20C0.44476 20 0 19.5447 0 19.0082L0 0.9918Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
];

function StatsCard({ label, value, svg }) {
  return (
    <Card className="w-full border-none flex flex-col gap-2">
      <CardHeader>
        <CardTitle>
          <div className="w-10 h-10 bg-[rgba(152,134,254,0.1)] rounded-md flex items-center justify-center mb-2">
            {svg}
          </div>
          <h1 className="text-2xl font-medium text-black">{value}</h1>
          <h2 className="text-sm font-medium text-gray-500">{label}</h2>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex" style={{ background: "#f8f9fa" }}>
      <Sidebar />
      <div className="flex flex-col gap-2 flex-2 border-l-2 border-[#E5E7EB]">
        <nav className="flex py-3 w-full justify-between items-center px-5 bg-white">
          <div>
            <h1 className="text-md font-medium text-black">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <img src="image.png" width={40} height={40} alt="" />
          </div>
        </nav>
        <div className="flex px-4 py-4">
          <span className="flex gap-0 flex-col ">
            <h1 className="text-[24px] font-medium text-black">Welcome back, Admin</h1>
            <h2 className="text-sm text-gray-500">Here's what's happening with your school today.</h2>
          </span>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-4 px-4 py-4 gap-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>
        <div className="flex items-center h-full">
          <div className="px-4 py-4">
            <ChartLineDots />
          </div>
          <EventCalendarCard />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
