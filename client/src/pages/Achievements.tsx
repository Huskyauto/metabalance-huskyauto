import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Achievements() {
  const [, setLocation] = useLocation();
  const { data: achievements, isLoading } = trpc.achievements.getAll.useQuery();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-700 to-amber-900';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-amber-700';
      case 'silver': return 'border-gray-400';
      case 'gold': return 'border-yellow-400';
      case 'platinum': return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };

  const groupedAchievements = achievements?.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const categoryTitles = {
    milestone: 'Milestones',
    weight: 'Weight Loss',
    streak: 'Streaks',
    consistency: 'Consistency',
  };

  const unlockedCount = achievements?.filter(a => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your progress and unlock badges
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {unlockedCount}/{totalCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unlocked</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-32" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAchievements || {}).map(([category, categoryAchievements]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {categoryTitles[category as keyof typeof categoryTitles]}
                  </CardTitle>
                  <CardDescription>
                    {categoryAchievements.filter(a => a.unlocked).length} of {categoryAchievements.length} unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                          achievement.unlocked
                            ? `bg-gradient-to-br ${getTierColor(achievement.tier)} ${getTierBorder(achievement.tier)} shadow-lg hover:scale-105`
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                        }`}
                      >
                        {/* Lock overlay for locked achievements */}
                        {!achievement.unlocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-5 w-5 text-gray-500" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className="text-5xl mb-3 text-center">
                          {achievement.unlocked ? achievement.icon : '🔒'}
                        </div>

                        {/* Name */}
                        <h3 className={`text-lg font-bold text-center mb-2 ${
                          achievement.unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {achievement.name}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm text-center ${
                          achievement.unlocked ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>

                        {/* Unlock date */}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-center text-white/75 mt-3">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}

                        {/* Tier badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                          achievement.unlocked ? 'bg-white/20 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.tier.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
