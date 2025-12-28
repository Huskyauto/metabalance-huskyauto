import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { TrendingDown, Calendar } from "lucide-react";

type TimeRange = 7 | 30 | 90;

export function ProgressCharts() {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - timeRange);
    return { startDate: start, endDate: end };
  }, [timeRange]);

  // Fetch progress logs
  const { data: progressLogs } = trpc.progress.list.useQuery(
    {
      startDate,
      endDate,
    },
    {
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    }
  );

  // Fetch user profile for target weight
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!progressLogs || progressLogs.length === 0) return [];

    return progressLogs
      .filter((log: any) => log.weight !== null)
      .map((log: any) => ({
        date: new Date(log.loggedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: log.weight,
        timestamp: new Date(log.loggedAt).getTime(),
      }))
      .reverse(); // Oldest to newest for chart
  }, [progressLogs]);

  // Calculate projected completion date
  const projection = useMemo(() => {
    if (!chartData || chartData.length < 2 || !profile?.targetWeight) {
      return null;
    }

    const currentWeight = chartData[chartData.length - 1].weight;
    const startWeight = chartData[0].weight;
    const targetWeight = profile.targetWeight;

    // Calculate rate of weight loss (lbs per day)
    const totalDays = (chartData[chartData.length - 1].timestamp - chartData[0].timestamp) / (1000 * 60 * 60 * 24);
    const weightLost = startWeight - currentWeight;
    const ratePerDay = weightLost / totalDays;

    if (ratePerDay <= 0) {
      return {
        message: "No weight loss trend detected yet. Keep going!",
        date: null,
        daysRemaining: null,
      };
    }

    // Calculate days to goal
    const weightToLose = currentWeight - targetWeight;
    const daysToGoal = Math.ceil(weightToLose / ratePerDay);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);

    return {
      message: `At your current pace (${ratePerDay.toFixed(2)} lbs/day), you'll reach your goal by:`,
      date: projectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      daysRemaining: daysToGoal,
    };
  }, [chartData, profile]);

  if (!progressLogs || progressLogs.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No progress data yet. Log your weight in the Progress Tracking page to see your trend!
        </p>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No weight data in the selected time range. Try a longer period or log more entries.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-teal-600" />
          Weight Progress
        </h3>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              domain={["dataMin - 5", "dataMax + 5"]}
              label={{ value: "Weight (lbs)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {profile?.targetWeight && (
              <ReferenceLine
                y={profile.targetWeight}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: "Goal", position: "right", fill: "#10b981" }}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: "#14b8a6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Weight (lbs)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {projection && (
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-teal-900 dark:text-teal-100 font-medium">
                {projection.message}
              </p>
              {projection.date && (
                <p className="text-lg font-bold text-teal-700 dark:text-teal-300 mt-1">
                  {projection.date}
                </p>
              )}
              {projection.daysRemaining !== null && (
                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                  ({projection.daysRemaining} days remaining)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Showing {chartData.length} weight entries over the last {timeRange} days
      </div>
    </Card>
  );
}
