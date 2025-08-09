import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const attendanceData = [
  { month: "January", attendance: 78 },
  { month: "February", attendance: 85 },
  { month: "March", attendance: 90 },
  { month: "April", attendance: 80 },
  { month: "May", attendance: 75 },
  { month: "June", attendance: 88 },
  { month: "July", attendance: 82 },
];

export function AttendanceLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Attendance</CardTitle>
        <CardDescription>January - July 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px] w-full">
          <LineChart
            width={500}
            height={300}
            data={attendanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[50, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#9886fe"
              strokeWidth={2}
              dot={{ fill: "#9886fe", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
}
