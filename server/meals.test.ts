import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

let testUserId: number;

async function createAuthContext(): Promise<TrpcContext> {
  const user: AuthenticatedUser = {
    id: testUserId,
    openId: "test-meals-user",
    email: "test-meals@example.com",
    name: "Test Meals User",
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

describe("meals.create", () => {
  beforeAll(async () => {
    // Create test user (required for foreign key constraint)
    await db.upsertUser({
      openId: 'test-meals-user',
      name: 'Test Meals User',
      email: 'test-meals@example.com',
      loginMethod: 'test',
      role: 'user',
      lastSignedIn: new Date(),
    });
    
    // Get the actual user ID
    const user = await db.getUserByOpenId('test-meals-user');
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;
  });
  
  it("creates a meal with nutrition data", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.meals.create({
      loggedAt: new Date(),
      mealType: "breakfast",
      foodName: "Oatmeal with berries",
      servingSize: "1 cup",
      calories: 300,
      protein: 10,
      carbs: 50,
      fats: 5,
      fiber: 8,
      notes: "Delicious and filling",
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
      caller.meals.create({
        loggedAt: new Date(),
        mealType: "breakfast",
        foodName: "Test meal",
        calories: 100,
      })
    ).rejects.toThrow();
  });
});

describe("meals.getByDate", () => {
  it("returns meals for a specific date", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const result = await caller.meals.getByDate({ date: today });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("meals.getDailyTotals", () => {
  it("calculates daily nutrition totals", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const totals = await caller.meals.getDailyTotals({ date: today });
    
    expect(totals).toHaveProperty("calories");
    expect(totals).toHaveProperty("protein");
    expect(totals).toHaveProperty("carbs");
    expect(totals).toHaveProperty("fats");
    expect(totals).toHaveProperty("fiber");
    expect(typeof totals.calories).toBe("number");
  });
});

describe("meals.getWeeklyData", () => {
  it("returns weekly nutrition data", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await caller.meals.getWeeklyData({
      startDate: weekAgo,
      endDate: today,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
