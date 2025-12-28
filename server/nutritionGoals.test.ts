import { describe, it, expect } from "vitest";
import { calculateNutritionGoals } from "./nutritionGoals";

describe("Nutrition Goals Calculator", () => {
  it("calculates correct goals for user profile (312 lbs, 72 in, 61 years, very active male)", () => {
    const profile = {
      currentWeight: 312,
      height: 72,
      age: 61,
      gender: "male" as const,
      activityLevel: "very_active" as const,
    };

    const goals = calculateNutritionGoals(profile);

    // Expected values based on Mifflin-St Jeor:
    // BMR: ~2258 cal
    // TDEE (very active 1.9x): ~4291 cal
    // Target (500 cal deficit): ~3791 cal
    // Protein: 234g (75% lean mass * 1g/lb)
    // Fats: 109g (0.35g/lb)
    // Carbs: remainder (~468g)
    // Fiber: 35g

    expect(goals.dailyCalories).toBeGreaterThan(3700);
    expect(goals.dailyCalories).toBeLessThan(3900);
    
    expect(goals.dailyProtein).toBeGreaterThan(220);
    expect(goals.dailyProtein).toBeLessThan(250);
    
    expect(goals.dailyCarbs).toBeGreaterThan(450);
    expect(goals.dailyCarbs).toBeLessThan(500);
    
    expect(goals.dailyFats).toBeGreaterThan(100);
    expect(goals.dailyFats).toBeLessThan(120);
    
    expect(goals.dailyFiber).toBe(35);
  });

  it("calculates different goals for sedentary activity level", () => {
    const profile = {
      currentWeight: 312,
      height: 72,
      age: 61,
      gender: "male" as const,
      activityLevel: "sedentary" as const,
    };

    const goals = calculateNutritionGoals(profile);

    // Sedentary multiplier is 1.2x, so TDEE should be much lower
    expect(goals.dailyCalories).toBeLessThan(3000);
  });

  it("calculates different goals for female gender", () => {
    const profileMale = {
      currentWeight: 200,
      height: 68,
      age: 40,
      gender: "male" as const,
      activityLevel: "moderate" as const,
    };

    const profileFemale = {
      currentWeight: 200,
      height: 68,
      age: 40,
      gender: "female" as const,
      activityLevel: "moderate" as const,
    };

    const goalsMale = calculateNutritionGoals(profileMale);
    const goalsFemale = calculateNutritionGoals(profileFemale);

    // Female BMR is ~166 calories lower than male
    expect(goalsFemale.dailyCalories).toBeLessThan(goalsMale.dailyCalories);
  });

  it("adjusts protein based on body weight", () => {
    const profile150 = {
      currentWeight: 150,
      height: 68,
      age: 40,
      gender: "male" as const,
      activityLevel: "moderate" as const,
    };

    const profile300 = {
      currentWeight: 300,
      height: 68,
      age: 40,
      gender: "male" as const,
      activityLevel: "moderate" as const,
    };

    const goals150 = calculateNutritionGoals(profile150);
    const goals300 = calculateNutritionGoals(profile300);

    // Protein should scale with lean body mass
    expect(goals300.dailyProtein).toBeGreaterThan(goals150.dailyProtein * 1.5);
  });
});
