import React from "react";
import { Calendar } from "@/components/ui/calendar"; // shadcn/ui calendar
import { Card } from "@/components/ui/card";

// Example event dates (add your own logic/data here)
const eventDates = [
  new Date(2024, 1, 5),  // Feb 5, 2024
  new Date(2024, 1, 12), // Feb 12, 2024
  new Date(2024, 1, 15), // Feb 15, 2024
  new Date(2024, 1, 22), // Feb 22, 2024
];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export default function EventCalendarCard() {
  const [selected, setSelected] = React.useState();

  // Custom render for day cells to show event dots
  function renderDay(day) {
    if (!day) return null;
    const hasEvent = eventDates.some((d) => isSameDay(d, day));
    return (
      <div className="relative flex flex-col items-center">
        <span>{day.getDate()}</span>
        {hasEvent && (
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400"
            style={{ marginTop: 2 }}
          />
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-2xl p-6 w-full max-w-md shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Event Calendar</h2>
        <span className="text-gray-400">
          <svg width="24" height="24" fill="none"><path d="M7 10h10M7 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
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
            if (!date) return <span />;
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
