import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Apple, Clock, Pill, TrendingDown, MessageSquare, BookOpen, LogOut, Settings, FlaskConical, Calendar, Trophy, Target, Brain, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyWins } from "@/components/DailyWins";
import { ProgressCharts } from "@/components/ProgressCharts";
import { StreakTracker } from "@/components/StreakTracker";
import { WaterTracker } from "@/components/WaterTracker";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
  const { data: latestProgress } = trpc.progress.latest.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
  const { data: todayInsight } = trpc.insights.getToday.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (!user) {
    setLocation("/");
    return null;
  }

  // If no profile, redirect to onboarding
  if (!profileLoading && !profile) {
    setLocation("/onboarding");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MetaBalance</h1>
                <p className="text-sm text-muted-foreground">Your Metabolic Health Journey</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name || "User"}</span>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Daily Wins and Streak Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DailyWins />
          <StreakTracker />
        </div>

        {/* Progress Charts & Water Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProgressCharts />
          </div>
          <div>
            <WaterTracker />
          </div>
        </div>

        {/* Daily Insight */}
        {todayInsight ? (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Today's Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{todayInsight.content}</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Progress Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/profile")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Weight</CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  {latestProgress?.weight || profile?.currentWeight || "--"} <span className="text-lg font-normal text-muted-foreground">lbs</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Click to edit</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/profile")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Target Weight</CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  {profile?.targetWeight || "--"} <span className="text-lg font-normal text-muted-foreground">lbs</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Click to edit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">To Go</CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold">
                  {profile?.currentWeight && profile?.targetWeight
                    ? Math.abs((latestProgress?.weight || profile.currentWeight) - profile.targetWeight)
                    : "--"}{" "}
                  <span className="text-lg font-normal text-muted-foreground">lbs</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/meals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Apple className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Dietary Tracking</CardTitle>
                    <CardDescription>Log meals & view nutrition analytics</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/fasting">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Fasting Coach</CardTitle>
                    <CardDescription>Track your fasting schedule</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/supplements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Supplements</CardTitle>
                    <CardDescription>Manage your supplements</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle>Progress Tracking</CardTitle>
                    <CardDescription>View your journey</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>AI Coach</CardTitle>
                    <CardDescription>Get personalized advice</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/journey">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle>90lb Journey</CardTitle>
                    <CardDescription>4-phase structured program</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/achievements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>View your badges & milestones</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/education">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Learn about metabolic health</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/emotional-eating">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Emotional Eating</CardTitle>
                    <CardDescription>Track triggers & patterns</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/medications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Medications</CardTitle>
                    <CardDescription>Track treatment & adherence</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/mindfulness">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle>Mindfulness</CardTitle>
                    <CardDescription>MB-EAT exercises & urge surfing</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/research">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Weight Loss Research</CardTitle>
                    <CardDescription>Latest scientific findings</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Health Profile</CardTitle>
                    <CardDescription>Update your health metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/reflection">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Weekly Reflection</CardTitle>
                    <CardDescription>Review your progress & patterns</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
