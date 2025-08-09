import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { month: "January", enrollment: 480 },
  { month: "February", enrollment: 675 },
  { month: "March", enrollment: 870 },
  { month: "April", enrollment: 1080 },
  { month: "May", enrollment: 1335 },
  { month: "June", enrollment: 1650 },
  { month: "July", enrollment: 2000 },
];

export function ChartLineDots() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Trends</CardTitle>
        <CardDescription>January - July 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px] w-full">
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="enrollment"
              stroke="#9886fe"
              strokeWidth={2}
              dot={{ fill: "#9886fe", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 525% this semester <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total enrollments from January to July 2024
        </div>
      </CardFooter> */}
    </Card>
  );
}