import React from "react";
import { Calendar } from "@/components/ui/calendar"; // Ensure this path is correct
import { Card } from "@/components/ui/card";

// Dummy event data — adjust as needed
const eventDates = [
  new Date(2024, 7, 10),  // August 10, 2024
  new Date(2024, 7, 12),  // August 12, 2024
  new Date(2024, 7, 14),  // August 14, 2024
  new Date(2024, 7, 20),  // August 20, 2024
];

function isSameDay(a, b) {
  if (!a || !b) return false; // Safely handle undefined
  return (
    a.getDate?.() === b.getDate?.() &&
    a.getMonth?.() === b.getMonth?.() &&
    a.getFullYear?.() === b.getFullYear?.()
  );
}


export default function EventCalendarCard() {
  const [selected, setSelected] = React.useState();

  return (
    <Card className="rounded-2xl p-6 w-full max-w-md shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Event Calendar</h2>
        <span className="text-gray-400">
          <svg width="24" height="24" fill="none">
            <path
              d="M7 10h10M7 14h5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        className="rounded-md border w-full"
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2025}
        components={{
          Day: ({ date, children, ...props }) => {
            const hasEvent = eventDates.some((d) => isSameDay(d, date));
            return (
              <button {...props} type="button" className={props.className}>
                <span className="relative flex flex-col items-center">
                  {children}
                  {hasEvent && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400"
                      style={{ marginTop: 2 }}
                    />
                  )}
                </span>
              </button>
            );
          },
        }}
      />        
    </Card>
  );
}
