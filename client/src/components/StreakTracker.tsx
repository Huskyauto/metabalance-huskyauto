import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { Flame, Trophy, Star } from "lucide-react";

export function StreakTracker() {
  // Fetch last 90 days of goals to calculate streak
  const ninetyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const { data: weeklyGoals } = trpc.dailyGoals.getWeek.useQuery(
    {
      weekStartDate: ninetyDaysAgo,
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Calculate current streak (consecutive days with 3+ stars)
  const streakData = useMemo(() => {
    if (!weeklyGoals || weeklyGoals.length === 0) {
      return { currentStreak: 0, longestStreak: 0, milestone: null };
    }

    // Sort by date descending (most recent first)
    const sortedGoals = [...weeklyGoals].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedGoals.length; i++) {
      const goalDate = new Date(sortedGoals[i].date);
      goalDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - goalDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if this goal is for the expected day in the streak
      if (daysDiff === currentStreak && (sortedGoals[i].winScore || 0) >= 3) {
        currentStreak++;
      } else if (daysDiff === currentStreak) {
        // Found a day with < 3 stars, streak ends
        break;
      }
    }

    // Calculate longest streak in the dataset
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const goal of sortedGoals) {
      const goalDate = new Date(goal.date);
      goalDate.setHours(0, 0, 0, 0);

      if ((goal.winScore || 0) >= 3) {
        if (lastDate) {
          const daysDiff = Math.floor((lastDate.getTime() - goalDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = goalDate;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        lastDate = null;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Determine milestone
    let milestone = null;
    if (currentStreak >= 30) {
      milestone = { days: 30, label: "30-Day Champion!", color: "from-purple-500 to-pink-500" };
    } else if (currentStreak >= 14) {
      milestone = { days: 14, label: "2-Week Warrior!", color: "from-orange-500 to-red-500" };
    } else if (currentStreak >= 7) {
      milestone = { days: 7, label: "Week Strong!", color: "from-yellow-500 to-orange-500" };
    } else if (currentStreak >= 3) {
      milestone = { days: 3, label: "Building Momentum!", color: "from-teal-500 to-emerald-500" };
    }

    return { currentStreak, longestStreak, milestone };
  }, [weeklyGoals]);

  const { currentStreak, longestStreak, milestone } = streakData;

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Streak Tracker
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Consecutive days with 3+ stars
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
            {currentStreak > 0 && <Flame className="w-8 h-8 text-orange-500 animate-pulse" />}
            {currentStreak}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            {currentStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {milestone && (
        <div className={`mb-4 p-4 rounded-lg bg-gradient-to-r ${milestone.color} text-white animate-in slide-in-from-bottom duration-500`}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">{milestone.label}</p>
              <p className="text-sm opacity-90">
                {currentStreak} days of consistent progress!
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStreak === 0 && (
        <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Complete 3+ goals today to start your streak!
          </p>
        </div>
      )}

      {currentStreak > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700 dark:text-orange-300">
              Longest streak:
            </span>
            <span className="font-bold text-orange-900 dark:text-orange-100 flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      )}

      {currentStreak > 0 && currentStreak < 30 && (
        <div className="mt-3 text-center text-xs text-orange-600 dark:text-orange-400">
          {currentStreak < 3 && "Keep going! 3 days unlocks your first milestone 🎯"}
          {currentStreak >= 3 && currentStreak < 7 && `${7 - currentStreak} more days to Week Strong! 💪`}
          {currentStreak >= 7 && currentStreak < 14 && `${14 - currentStreak} more days to 2-Week Warrior! 🔥`}
          {currentStreak >= 14 && currentStreak < 30 && `${30 - currentStreak} more days to 30-Day Champion! 👑`}
        </div>
      )}
    </Card>
  );
}
