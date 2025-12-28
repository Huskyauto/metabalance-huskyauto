/**
 * Achievement system - defines all available achievements and unlock logic
 */

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  category: 'weight' | 'streak' | 'consistency' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
  // First steps
  first_week: {
    id: 'first_week',
    name: 'First Week Complete',
    description: 'Completed your first week of tracking',
    icon: '🌱',
    category: 'milestone',
    tier: 'bronze',
  },
  first_meal_logged: {
    id: 'first_meal_logged',
    name: 'Meal Logger',
    description: 'Logged your first meal',
    icon: '🍽️',
    category: 'milestone',
    tier: 'bronze',
  },
  
  // Weight loss milestones
  weight_5lbs: {
    id: 'weight_5lbs',
    name: '5 Pounds Down',
    description: 'Lost 5 pounds from your starting weight',
    icon: '🎯',
    category: 'weight',
    tier: 'bronze',
  },
  weight_10lbs: {
    id: 'weight_10lbs',
    name: '10 Pounds Down',
    description: 'Lost 10 pounds from your starting weight',
    icon: '💪',
    category: 'weight',
    tier: 'silver',
  },
  weight_25lbs: {
    id: 'weight_25lbs',
    name: '25 Pounds Down',
    description: 'Lost 25 pounds from your starting weight',
    icon: '🏆',
    category: 'weight',
    tier: 'gold',
  },
  weight_50lbs: {
    id: 'weight_50lbs',
    name: '50 Pounds Down',
    description: 'Lost 50 pounds from your starting weight',
    icon: '👑',
    category: 'weight',
    tier: 'platinum',
  },
  weight_100lbs: {
    id: 'weight_100lbs',
    name: '100 Pounds Down',
    description: 'Lost 100 pounds from your starting weight',
    icon: '🌟',
    category: 'weight',
    tier: 'platinum',
  },
  
  // Streak achievements
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day streak of 3+ stars',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
  },
  streak_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: '30-day streak of 3+ stars',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
  },
  streak_100: {
    id: 'streak_100',
    name: 'Century Club',
    description: '100-day streak of 3+ stars',
    icon: '🔥',
    category: 'streak',
    tier: 'gold',
  },
  streak_365: {
    id: 'streak_365',
    name: 'Year Legend',
    description: '365-day streak of 3+ stars',
    icon: '🔥',
    category: 'streak',
    tier: 'platinum',
  },
  
  // Consistency achievements
  perfect_week: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '7 consecutive days with 5 stars',
    icon: '⭐',
    category: 'consistency',
    tier: 'silver',
  },
  perfect_month: {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: '30 consecutive days with 5 stars',
    icon: '⭐',
    category: 'consistency',
    tier: 'gold',
  },
  meal_tracker_pro: {
    id: 'meal_tracker_pro',
    name: 'Meal Tracker Pro',
    description: 'Logged 100 meals',
    icon: '📊',
    category: 'consistency',
    tier: 'silver',
  },
  goal_crusher: {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Achieved 50 perfect days (5 stars)',
    icon: '💯',
    category: 'consistency',
    tier: 'gold',
  },
};

/**
 * Check which achievements a user has unlocked based on their data
 */
export interface UserStats {
  currentWeight: number;
  startingWeight: number;
  currentStreak: number;
  longestStreak: number;
  totalMealsLogged: number;
  totalPerfectDays: number;
  consecutivePerfectDays: number;
  daysTracking: number;
}

export function checkUnlockedAchievements(stats: UserStats, existingAchievements: string[]): string[] {
  const newlyUnlocked: string[] = [];
  
  // Weight loss achievements
  const weightLost = stats.startingWeight - stats.currentWeight;
  
  if (weightLost >= 5 && !existingAchievements.includes('weight_5lbs')) {
    newlyUnlocked.push('weight_5lbs');
  }
  if (weightLost >= 10 && !existingAchievements.includes('weight_10lbs')) {
    newlyUnlocked.push('weight_10lbs');
  }
  if (weightLost >= 25 && !existingAchievements.includes('weight_25lbs')) {
    newlyUnlocked.push('weight_25lbs');
  }
  if (weightLost >= 50 && !existingAchievements.includes('weight_50lbs')) {
    newlyUnlocked.push('weight_50lbs');
  }
  if (weightLost >= 100 && !existingAchievements.includes('weight_100lbs')) {
    newlyUnlocked.push('weight_100lbs');
  }
  
  // Streak achievements
  if (stats.currentStreak >= 7 && !existingAchievements.includes('streak_7')) {
    newlyUnlocked.push('streak_7');
  }
  if (stats.currentStreak >= 30 && !existingAchievements.includes('streak_30')) {
    newlyUnlocked.push('streak_30');
  }
  if (stats.currentStreak >= 100 && !existingAchievements.includes('streak_100')) {
    newlyUnlocked.push('streak_100');
  }
  if (stats.currentStreak >= 365 && !existingAchievements.includes('streak_365')) {
    newlyUnlocked.push('streak_365');
  }
  
  // Consistency achievements
  if (stats.consecutivePerfectDays >= 7 && !existingAchievements.includes('perfect_week')) {
    newlyUnlocked.push('perfect_week');
  }
  if (stats.consecutivePerfectDays >= 30 && !existingAchievements.includes('perfect_month')) {
    newlyUnlocked.push('perfect_month');
  }
  if (stats.totalMealsLogged >= 100 && !existingAchievements.includes('meal_tracker_pro')) {
    newlyUnlocked.push('meal_tracker_pro');
  }
  if (stats.totalPerfectDays >= 50 && !existingAchievements.includes('goal_crusher')) {
    newlyUnlocked.push('goal_crusher');
  }
  
  // Milestone achievements
  if (stats.daysTracking >= 7 && !existingAchievements.includes('first_week')) {
    newlyUnlocked.push('first_week');
  }
  if (stats.totalMealsLogged >= 1 && !existingAchievements.includes('first_meal_logged')) {
    newlyUnlocked.push('first_meal_logged');
  }
  
  return newlyUnlocked;
}
