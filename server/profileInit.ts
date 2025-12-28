/**
 * Profile Initialization Service
 * Ensures user profile is initialized with correct values on first login
 */

import { getMetabolicProfile, upsertMetabolicProfile } from "./db";

export interface UserProfileDefaults {
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

/**
 * Initialize or update user profile with correct values
 * This prevents test data from persisting in production
 */
export async function ensureProfileInitialized(
  userId: number,
  defaults: UserProfileDefaults
): Promise<void> {
  const profile = await getMetabolicProfile(userId);

  // If profile doesn't exist or has test data (200/160), initialize with correct values
  const hasTestData =
    profile &&
    profile.currentWeight === 200 &&
    profile.targetWeight === 160;

  if (!profile || hasTestData) {
    await upsertMetabolicProfile({
      userId,
      currentWeight: defaults.currentWeight,
      targetWeight: defaults.targetWeight,
      height: defaults.height,
      age: defaults.age,
      gender: defaults.gender,
      activityLevel: defaults.activityLevel,
      // Set reasonable defaults for other fields
      hasObesity: defaults.currentWeight > 200,
      hasDiabetes: false,
      hasMetabolicSyndrome: false,
      hasNAFLD: false,
      takingGLP1: false,
      stressLevel: "moderate",
      sleepQuality: "good",
      susceptibleToLinoleicAcid: true,
      lowNADLevels: false,
      poorGutHealth: false,
      primaryGoal: `Lose ${defaults.currentWeight - defaults.targetWeight} lbs`,
    });
  }
}

/**
 * Get default profile values for the app owner
 * These are the user's actual values that should persist
 */
export function getOwnerProfileDefaults(): UserProfileDefaults {
  return {
    currentWeight: 312,
    targetWeight: 225,
    height: 72,
    age: 61,
    gender: "male",
    activityLevel: "very_active",
  };
}
