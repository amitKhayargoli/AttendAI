import React from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLineDots } from "@/components/ChartLineDots";
import EventCalendarCard from "@/components/EventCalendarCard";
import TeacherNavbar from "@/components/TeacherNavbar";
import ClassSchedule from "./ClassSchedule";

const stats = [
  {
    label: "My Students",
    value: "150",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M0 21C0 16.5817 3.58172 13 8 13C12.4183 13 16 16.5817 16 21L14 21C14 17.6863 11.3137 15 8 15C4.68629 15 2 17.6863 2 21L0 21ZM8 12C4.685 12 2 9.315 2 6C2 2.685 4.685 0 8 0C11.315 0 14 2.685 14 6C14 9.315 11.315 12 8 12ZM8 10C10.21 10 12 8.21 12 6C12 3.79 10.21 2 8 2C5.79 2 4 3.79 4 6C4 8.21 5.79 10 8 10Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "My Subjects",
    value: "5",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M11 18L11 20L9 20L9 18L1 18C0.44772 18 0 17.5523 0 17L0 1C0 0.44772 0.44772 0 1 0L7 0C8.1947 0 9.2671 0.52375 10 1.35418C10.7329 0.52375 11.8053 0 13 0L19 0C19.5523 0 20 0.44772 20 1L20 17C20 17.5523 19.5523 18 19 18L11 18ZM18 16L18 2L13 2C11.8954 2 11 2.89543 11 4L11 16L18 16ZM9 16L9 4C9 2.89543 8.1046 2 7 2L2 2L2 16L9 16Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "Today's Classes",
    value: "4",
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M3 0C1.34315 0 0 1.34315 0 3V21C0 22.6569 1.34315 24 3 24H21C22.6569 24 24 22.6569 24 21V3C24 1.34315 22.6569 0 21 0H3ZM21 2C21.5523 2 22 2.44772 22 3V7H2V3C2 2.44772 2.44772 2 3 2H21ZM2 9H22V21C22 21.5523 21.5523 22 21 22H3C2.44772 22 2 21.5523 2 21V9ZM6 11V13H8V11H6ZM10 11V13H12V11H10ZM14 11V13H16V11H14Z" fill="rgb(152, 134, 254)"/></g></svg>
    ),
  },
  {
    label: "My Attendance Rate",
    value: "98.2%",
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

const TeacherDashboard = () => {
  return (
    <div className="min-h-screen flex" style={{ background: "#f8f9fa" }}>


      <div className="flex flex-col gap-0 flex-2">
        <TeacherNavbar/>

        <div className="flex flex-col gap-0 flex-2 px-5">

    
        <div className="flex px-4 py-4">
          <span className="flex gap-0 flex-col">
            <h1 className="text-3xl font-medium text-black">Welcome back</h1>
            <h2 className="text-lg text-gray-500">Here's your teaching summary for today.</h2>
          </span>
        </div>
        <div className="grid grid-cols-4 px-4 py-2 gap-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>
        <div className="flex items-center h-full ml-4 mt-2 gap-4">
            <EventCalendarCard />
            <ClassSchedule />
        </div>

        
      </div>
    </div>
    </div>
  );
};

export default TeacherDashboard;
