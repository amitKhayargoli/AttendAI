import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient"; // make sure this path is correct
import { useUser } from "@supabase/auth-helpers-react";

const ClassSchedule = () => {
  const user = useUser();
  const [todaysClasses, setTodaysClasses] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchTodaysSchedule = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("classes")
        .select("subject, start_time, end_time, room, class_name, date")
        .eq("teacher_id", user.id)
        .eq("date", today)
        .order("start_time");

      if (error) {
        console.error("Failed to fetch class schedule:", error.message);
      } else {
        setTodaysClasses(data);
      }
    };

    fetchTodaysSchedule();
  }, [user, today]);

  return (
    <Card className="w-full shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg">Today's Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {todaysClasses.length > 0 ? (
          <ul className="space-y-3">
            {todaysClasses.map((cls, index) => (
              <li key={index} className="border p-5 rounded-md">
                <div className="font-semibold text-[#9886fe]">{cls.subject}</div>
                <div className="text-sm text-muted-foreground">
                  {cls.class_name} · {cls.room}
                </div>
                <div className="text-sm">
                  {cls.start_time} - {cls.end_time}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No classes scheduled for today.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassSchedule;
