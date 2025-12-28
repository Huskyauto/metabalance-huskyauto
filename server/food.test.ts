import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import type { Request, Response } from "express";

// Mock user for protected procedures
const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  openId: "test-open-id",
  role: "user" as const,
};

// Create mock request and response
const mockReq = {} as Request;
const mockRes = {} as Response;

describe("Food Search Integration", () => {
  it("searches for chicken and returns results", async () => {
    const caller = appRouter.createCaller({
      ...createContext({ req: mockReq, res: mockRes }),
      user: mockUser,
    });

    const results = await caller.food.search({ query: "chicken", limit: 5 });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);

    // Check structure of first result
    const firstResult = results[0];
    expect(firstResult).toHaveProperty("id");
    expect(firstResult).toHaveProperty("name");
    expect(typeof firstResult.id).toBe("number");
    expect(typeof firstResult.name).toBe("string");
    expect(firstResult.name.toLowerCase()).toContain("chicken");
  });

  it("gets nutrition data for a specific ingredient", async () => {
    const caller = appRouter.createCaller({
      ...createContext({ req: mockReq, res: mockRes }),
      user: mockUser,
    });

    // First search for chicken breast
    const searchResults = await caller.food.search({ query: "chicken breast", limit: 1 });
    expect(searchResults.length).toBeGreaterThan(0);

    const ingredientId = searchResults[0].id;

    // Get nutrition for 100g
    const nutrition = await caller.food.getNutrition({
      ingredientId,
      amount: 100,
      unit: "g",
    });

    expect(nutrition).toBeDefined();
    expect(nutrition.calories).toBeGreaterThan(0);
    expect(nutrition.protein).toBeGreaterThan(0);
    expect(typeof nutrition.carbs).toBe("number");
    expect(typeof nutrition.fat).toBe("number");
    expect(typeof nutrition.fiber).toBe("number");

    // Chicken breast should have high protein, low carbs
    expect(nutrition.protein).toBeGreaterThan(15); // At least 15g protein per 100g
    expect(nutrition.carbs).toBeLessThan(5); // Very low carbs
  });

  it("searches for banana and returns results", async () => {
    const caller = appRouter.createCaller({
      ...createContext({ req: mockReq, res: mockRes }),
      user: mockUser,
    });

    const results = await caller.food.search({ query: "banana", limit: 5 });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Should find banana
    const hasBanana = results.some(r => r.name.toLowerCase().includes("banana"));
    expect(hasBanana).toBe(true);
  });

  it("gets nutrition data for banana", async () => {
    const caller = appRouter.createCaller({
      ...createContext({ req: mockReq, res: mockRes }),
      user: mockUser,
    });

    // Search for banana
    const searchResults = await caller.food.search({ query: "banana", limit: 1 });
    expect(searchResults.length).toBeGreaterThan(0);

    const ingredientId = searchResults[0].id;

    // Get nutrition for 100g
    const nutrition = await caller.food.getNutrition({
      ingredientId,
      amount: 100,
      unit: "g",
    });

    expect(nutrition).toBeDefined();
    expect(nutrition.calories).toBeGreaterThan(0);

    // Banana should have high carbs, low protein
    expect(nutrition.carbs).toBeGreaterThan(15); // At least 15g carbs per 100g
    expect(nutrition.protein).toBeLessThan(5); // Low protein
  });

  it("respects the limit parameter", async () => {
    const caller = appRouter.createCaller({
      ...createContext({ req: mockReq, res: mockRes }),
      user: mockUser,
    });

    const results = await caller.food.search({ query: "chicken", limit: 3 });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
