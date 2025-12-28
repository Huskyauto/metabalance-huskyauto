import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function NutritionAnalytics() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

  const { data: weeklyData = [], isLoading } = trpc.meals.getWeeklyData.useQuery(
    {
      startDate: weekStart,
      endDate: weekEnd,
    },
    {
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const goToPreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const goToNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  // Format data for charts
  const chartData = weeklyData.map(day => ({
    ...day,
    date: format(new Date(day.date), "MMM d"),
  }));

  // Calculate weekly averages
  const weeklyAverages = weeklyData.length > 0 ? {
    calories: Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length),
    protein: Math.round(weeklyData.reduce((sum, d) => sum + d.protein, 0) / weeklyData.length),
    carbs: Math.round(weeklyData.reduce((sum, d) => sum + d.carbs, 0) / weeklyData.length),
    fats: Math.round(weeklyData.reduce((sum, d) => sum + d.fats, 0) / weeklyData.length),
    fiber: Math.round(weeklyData.reduce((sum, d) => sum + d.fiber, 0) / weeklyData.length),
  } : null;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/meals'}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dietary Tracking
        </Button>
        <h1 className="text-3xl font-bold mb-2">Nutrition Analytics</h1>
        <p className="text-muted-foreground">
          Track your weekly nutrition trends and patterns
        </p>
      </div>

      {/* Week Navigation */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </p>
            </div>

            <Button variant="outline" onClick={goToCurrentWeek}>
              Current Week
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Weekly Averages */}
      {weeklyAverages && (
        <Card className="p-6 mb-6 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Weekly Averages</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyAverages.calories}</p>
              <p className="text-sm text-muted-foreground">Calories/day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyAverages.protein}g</p>
              <p className="text-sm text-muted-foreground">Protein/day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyAverages.carbs}g</p>
              <p className="text-sm text-muted-foreground">Carbs/day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyAverages.fats}g</p>
              <p className="text-sm text-muted-foreground">Fats/day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeklyAverages.fiber}g</p>
              <p className="text-sm text-muted-foreground">Fiber/day</p>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : chartData.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No nutrition data for this week</p>
          <p className="text-sm text-muted-foreground">
            Start logging your meals to see your nutrition trends
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Calories Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Calories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Macronutrients Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Macronutrients</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="protein" fill="#82ca9d" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#8884d8" name="Carbs (g)" />
                <Bar dataKey="fats" fill="#ffc658" name="Fats (g)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Fiber Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Fiber Intake</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fiber"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Fiber (g)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
