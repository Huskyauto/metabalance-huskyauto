import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Star, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import confetti from "canvas-confetti";

export function DailyWins() {
  // Use current date string as a key to force refresh when day changes
  const [dateKey, setDateKey] = useState(() => new Date().toDateString());
  
  // Create today's date based on the current dateKey
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, [dateKey]);
  
  const [celebrationShown, setCelebrationShown] = useState(false);
  
  // Check if date has changed and update dateKey
  useEffect(() => {
    const checkDate = () => {
      const currentDateString = new Date().toDateString();
      if (currentDateString !== dateKey) {
        setDateKey(currentDateString);
        setCelebrationShown(false);
      }
    };
    
    // Check immediately on mount
    checkDate();
    
    // Check every minute
    const interval = setInterval(checkDate, 60000);
    
    return () => clearInterval(interval);
  }, [dateKey]);

  const { data: dailyGoal, refetch } = trpc.dailyGoals.get.useQuery(
    { date: today },
    {
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );
  const checkAchievements = trpc.achievements.checkUnlocks.useMutation();
  
  const toggleGoal = trpc.dailyGoals.toggleGoal.useMutation({
    onSuccess: () => {
      refetch();
      // Check for newly unlocked achievements
      checkAchievements.mutate();
    },
  });

  const goals = [
    {
      id: "mealLogging",
      label: "Log 3+ Meals",
      completed: dailyGoal?.mealLoggingComplete || false,
      description: "Track breakfast, lunch, and dinner",
    },
    {
      id: "protein",
      label: "Hit Protein Goal",
      completed: dailyGoal?.proteinGoalComplete || false,
      description: "Meet your daily protein target",
    },
    {
      id: "fasting",
      label: "Complete Fast",
      completed: dailyGoal?.fastingGoalComplete || false,
      description: "Finish your fasting window",
    },
    {
      id: "exercise",
      label: "Log Exercise",
      completed: dailyGoal?.exerciseGoalComplete || false,
      description: "Record any physical activity",
    },
    {
      id: "water",
      label: "Drink Water",
      completed: dailyGoal?.waterGoalComplete || false,
      description: "Stay hydrated (8+ glasses)",
    },
  ];

  const winScore = dailyGoal?.winScore || 0;
  const completedCount = goals.filter((g) => g.completed).length;

  // Celebration effect when reaching 5 stars
  useEffect(() => {
    if (winScore === 5 && !celebrationShown) {
      setCelebrationShown(true);
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#14b8a6", "#fbbf24", "#f59e0b"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#14b8a6", "#fbbf24", "#f59e0b"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [winScore, celebrationShown]);

  // Reset celebration flag when day changes or score drops below 5
  useEffect(() => {
    if (winScore < 5) {
      setCelebrationShown(false);
    }
  }, [winScore]);

  const handleToggleGoal = (goalId: 'mealLogging' | 'protein' | 'fasting' | 'exercise' | 'water') => {
    toggleGoal.mutate({ date: today, goalId });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border-teal-200 dark:border-teal-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
            Today's Wins
          </h3>
          <p className="text-sm text-teal-700 dark:text-teal-300">
            {completedCount} of 5 goals completed
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 transition-all duration-300 ${
                star <= winScore
                  ? "fill-yellow-400 text-yellow-400 scale-110"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleToggleGoal(goal.id as 'mealLogging' | 'protein' | 'fasting' | 'exercise' | 'water')}
            disabled={toggleGoal.isPending}
            className="w-full flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 hover:bg-white/80 dark:hover:bg-gray-900/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5 animate-in zoom-in duration-300" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0 text-left">
              <p
                className={`font-medium transition-all duration-200 ${
                  goal.completed
                    ? "text-teal-900 dark:text-teal-100 line-through"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {goal.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {goal.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {winScore === 5 && (
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-300 dark:border-yellow-700 animate-in slide-in-from-bottom duration-500">
          <p className="text-center font-semibold text-yellow-900 dark:text-yellow-100">
            🎉 Perfect Day! All goals completed!
          </p>
        </div>
      )}

      {winScore >= 3 && winScore < 5 && (
        <div className="mt-4 p-3 rounded-lg bg-teal-100 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 animate-in slide-in-from-bottom duration-500">
          <p className="text-center font-medium text-teal-900 dark:text-teal-100">
            Great progress! Keep going! 💪
          </p>
        </div>
      )}
    </Card>
  );
}
