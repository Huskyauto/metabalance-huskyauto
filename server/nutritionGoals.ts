/**
 * Calculate personalized nutrition goals based on user's metabolic profile
 * Uses Mifflin-St Jeor equation for BMR and activity multipliers for TDEE
 */

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number; // grams
  dailyCarbs: number; // grams
  dailyFats: number; // grams
  dailyFiber: number; // grams
}

export interface ProfileData {
  currentWeight: number; // pounds
  height: number; // inches
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
function calculateBMR(profile: ProfileData): number {
  // Convert to metric
  const weightKg = profile.currentWeight * 0.453592;
  const heightCm = profile.height * 2.54;

  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  } else if (profile.gender === "female") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161;
  } else {
    // Use male formula as default for "other"
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  }

  return bmr;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return bmr * (multipliers[activityLevel] || 1.2);
}

/**
 * Calculate personalized nutrition goals
 */
export function calculateNutritionGoals(profile: ProfileData): NutritionGoals {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  // Apply moderate deficit for weight loss (500 cal/day)
  const targetCalories = Math.round(tdee - 500);

  // Protein: 1g per lb of lean body mass (estimate 75% lean mass)
  const leanMassLbs = profile.currentWeight * 0.75;
  const proteinG = Math.round(leanMassLbs * 1.0);
  const proteinCalories = proteinG * 4;

  // Fats: 0.35g per lb body weight
  const fatsG = Math.round(profile.currentWeight * 0.35);
  const fatsCalories = fatsG * 9;

  // Carbs: remainder of calories
  const remainingCalories = targetCalories - proteinCalories - fatsCalories;
  const carbsG = Math.round(remainingCalories / 4);

  // Fiber: 35g recommended for gut health
  const fiberG = 35;

  return {
    dailyCalories: targetCalories,
    dailyProtein: proteinG,
    dailyCarbs: carbsG,
    dailyFats: fatsG,
    dailyFiber: fiberG,
  };
}
