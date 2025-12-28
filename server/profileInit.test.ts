import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

describe("Profile Initialization", () => {
  let testUserId: number;
  
  beforeAll(async () => {
    // Create test user (required for foreign key constraint)
    await db.upsertUser({
      openId: 'test-profileinit-user-999999',
      name: 'Test ProfileInit User',
      email: 'test-profileinit@example.com',
      loginMethod: 'test',
      role: 'user',
      lastSignedIn: new Date(),
    });
    
    // Get the actual user ID
    const user = await db.getUserByOpenId('test-profileinit-user-999999');
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;
  });
  
  it("does not overwrite test user profiles", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    // First, create a test profile with specific values
    await caller.profile.upsert({
      currentWeight: 180,
      targetWeight: 150,
      height: 70,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
    });

    // Get the profile - should NOT be overwritten with owner defaults
    const profile = await caller.profile.get();
    
    expect(profile).toBeDefined();
    expect(profile?.currentWeight).toBe(180); // Should keep test values
    expect(profile?.targetWeight).toBe(150);
    expect(profile?.height).toBe(70);
  });

  it("initializes owner profile (user ID 1) with correct defaults", async () => {
    const ctx = createTestContext(1);
    const caller = appRouter.createCaller(ctx);

    // Get the profile - should be initialized with owner defaults
    const profile = await caller.profile.get();
    
    expect(profile).toBeDefined();
    // Owner defaults: 312 lbs current, 225 lbs target, 72 inches, 61 years, very active
    expect(profile?.currentWeight).toBe(312);
    expect(profile?.targetWeight).toBe(225);
    expect(profile?.height).toBe(72);
    expect(profile?.age).toBe(61);
    expect(profile?.gender).toBe("male");
    expect(profile?.activityLevel).toBe("very_active");
  });
});
