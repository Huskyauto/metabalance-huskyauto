import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

let testUserId: number;

async function createAuthContext(): Promise<TrpcContext> {
  const user: AuthenticatedUser = {
    id: testUserId,
    openId: "test-profile-user",
    email: "test-profile@example.com",
    name: "Test Profile User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("profile.upsert", () => {
  beforeAll(async () => {
    // Create test user (required for foreign key constraint)
    await db.upsertUser({
      openId: 'test-profile-user',
      name: 'Test Profile User',
      email: 'test-profile@example.com',
      loginMethod: 'test',
      role: 'user',
      lastSignedIn: new Date(),
    });
    
    // Get the actual user ID
    const user = await db.getUserByOpenId('test-profile-user');
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;
  });
  
  it("creates a new profile with valid data", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.profile.upsert({
      currentWeight: 200,
      targetWeight: 160,
      height: 68,
      age: 35,
      gender: "male",
      hasObesity: true,
      hasDiabetes: false,
      hasMetabolicSyndrome: false,
      hasNAFLD: false,
      takingGLP1: false,
      stressLevel: "moderate",
      sleepQuality: "fair",
      activityLevel: "moderate",
      susceptibleToLinoleicAcid: true,
      lowNADLevels: false,
      poorGutHealth: false,
      primaryGoal: "Lose 40 lbs in 6 months",
    });

    expect(result.success).toBe(true);
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.profile.upsert({
        currentWeight: 200,
        targetWeight: 160,
        height: 68,
        age: 35,
        gender: "male",
        hasObesity: false,
        hasDiabetes: false,
        hasMetabolicSyndrome: false,
        hasNAFLD: false,
        takingGLP1: false,
        stressLevel: "moderate",
        sleepQuality: "fair",
        activityLevel: "moderate",
        susceptibleToLinoleicAcid: false,
        lowNADLevels: false,
        poorGutHealth: false,
      })
    ).rejects.toThrow();
  });
});

describe("profile.get", () => {
  it("returns undefined for users without a profile", async () => {
    const ctx = await createAuthContext();
    // Create a different user ID that doesn't have a profile
    const nonExistentUser = { ...ctx.user!, id: 99999 };
    const modifiedCtx = { ...ctx, user: nonExistentUser };
    const caller = appRouter.createCaller(modifiedCtx);

    const result = await caller.profile.get();
    expect(result).toBeUndefined();
  });
});
