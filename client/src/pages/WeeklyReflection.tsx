import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, TrendingUp, Star, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

export default function WeeklyReflection() {
  const [, setLocation] = useLocation();
  const [wentWell, setWentWell] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Get current week's Monday
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: currentReflection, refetch } = trpc.weeklyReflections.get.useQuery({
    weekStartDate: weekStart,
  });

  const { data: recentReflections } = trpc.weeklyReflections.getRecent.useQuery({
    limit: 10,
  });

  const createReflection = trpc.weeklyReflections.create.useMutation({
    onSuccess: () => {
      refetch();
      setWentWell("");
      setChallenges("");
      setNextWeekPlan("");
    },
  });

  const handleSubmit = () => {
    if (!wentWell || !challenges || !nextWeekPlan) {
      alert("Please answer all three questions");
      return;
    }

    createReflection.mutate({
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      wentWell,
      challenges,
      nextWeekPlan,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setShowHistory(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to This Week
          </Button>

          <h1 className="text-3xl font-bold mb-2">Reflection History</h1>
          <p className="text-muted-foreground mb-8">
            Review your past weekly reflections and track your growth
          </p>

          <div className="space-y-6">
            {recentReflections?.map((reflection) => (
              <Card key={reflection.id} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">
                    Week of {formatDate(reflection.weekStartDate)}
                  </h3>
                </div>

                <div className="grid gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      {reflection.daysLogged}/7 days logged
                    </span>
                    <span className="mx-2">•</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {reflection.avgWinScore}/5 avg score
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-green-700 mb-1">
                      What went well:
                    </p>
                    <p className="text-sm">{reflection.wentWell}</p>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-orange-700 mb-1">
                      Challenges:
                    </p>
                    <p className="text-sm">{reflection.challenges}</p>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-blue-700 mb-1">
                      Next week plan:
                    </p>
                    <p className="text-sm">{reflection.nextWeekPlan}</p>
                  </div>

                  {reflection.aiInsights && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-purple-600" />
                        <p className="font-medium text-sm text-purple-900 dark:text-purple-100">
                          AI Insights:
                        </p>
                      </div>
                      <div className="text-sm text-purple-800 dark:text-purple-200 prose prose-sm max-w-none">
                        <Streamdown>{reflection.aiInsights}</Streamdown>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {!recentReflections || recentReflections.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No reflections yet. Complete your first weekly reflection!
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Weekly Reflection</h1>
            <p className="text-muted-foreground">
              Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            View History
          </Button>
        </div>

        {currentReflection ? (
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">This Week's Reflection</h3>
              </div>

              <div className="grid gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {currentReflection.daysLogged}/7 days logged
                  </span>
                  <span className="mx-2">•</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {currentReflection.avgWinScore}/5 avg score
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="font-medium text-sm text-green-700 mb-2">
                  What went well:
                </p>
                <p className="text-sm p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  {currentReflection.wentWell}
                </p>
              </div>

              <div>
                <p className="font-medium text-sm text-orange-700 mb-2">
                  Challenges:
                </p>
                <p className="text-sm p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  {currentReflection.challenges}
                </p>
              </div>

              <div>
                <p className="font-medium text-sm text-blue-700 mb-2">
                  Next week plan:
                </p>
                <p className="text-sm p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  {currentReflection.nextWeekPlan}
                </p>
              </div>

              {currentReflection.aiInsights && (
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      AI-Generated Insights
                    </h4>
                  </div>
                  <div className="prose prose-sm max-w-none text-purple-800 dark:text-purple-200">
                    <Streamdown>{currentReflection.aiInsights}</Streamdown>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                You've already completed this week's reflection. Come back next week!
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Take a moment to reflect on your week
              </h2>
              <p className="text-sm text-muted-foreground">
                Answer these three questions to gain insights into your progress and patterns
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-medium text-sm text-green-700 mb-2">
                  1. What went well this week?
                </label>
                <Textarea
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="Think about your wins, big or small. Did you stick to your meal plan? Complete your fasting windows? Feel more energetic?"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block font-medium text-sm text-orange-700 mb-2">
                  2. What was challenging?
                </label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Be honest about obstacles. Social events? Stress eating? Lack of sleep? Identifying challenges helps you plan better."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block font-medium text-sm text-blue-700 mb-2">
                  3. What will you do differently next week?
                </label>
                <Textarea
                  value={nextWeekPlan}
                  onChange={(e) => setNextWeekPlan(e.target.value)}
                  placeholder="Set 1-2 specific, actionable goals. Example: 'Meal prep on Sunday' or 'Go to bed by 10pm on weeknights'"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={createReflection.isPending}
                className="flex-1"
              >
                {createReflection.isPending
                  ? "Generating AI Insights..."
                  : "Complete Reflection"}
              </Button>
            </div>

            {createReflection.isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to save reflection. Please try again.
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
