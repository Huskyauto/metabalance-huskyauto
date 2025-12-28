import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createTestContext(userId: number): TrpcContext {
  return {
    user: { id: userId, name: "Test User", openId: "test" },
    req: {} as any,
    res: { clearCookie: () => {} } as any,
  };
}

describe("PDF Export", () => {
  const testUserId = 999999; // Use test user ID to avoid affecting production data
  
  beforeAll(async () => {
    // Create test user first (required for foreign key constraint)
    const dbConn = await db.getDb();
    if (dbConn) {
      await dbConn.execute(
        `INSERT INTO users (id, openId, name, createdAt, updatedAt) 
         VALUES (${testUserId}, 'test-${testUserId}', 'Test User', NOW(), NOW()) 
         ON DUPLICATE KEY UPDATE name = 'Test User'`
      );
    }
    
    // Create test profile
    await db.upsertMetabolicProfile({
      userId: testUserId,
      currentWeight: 200,
      targetWeight: 160,
      height: 70,
      age: 35,
      gender: "male",
      activityLevel: "moderate",
    });
    
    // Create test progress log
    await db.createProgressLog({
      userId: testUserId,
      loggedAt: new Date(),
      weight: 195,
    });
    
    // Create test daily goal
    await db.upsertDailyGoal({
      userId: testUserId,
      date: new Date(),
      logMeals: true,
      hitProtein: true,
      completeFast: false,
      logExercise: true,
      drinkWater: true,
      winScore: 4,
    });
  });

  it("generates PDF with user progress data", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.exportPDF();

    expect(result).toBeDefined();
    expect(result.pdf).toBeDefined();
    expect(result.filename).toBeDefined();
    expect(result.filename).toMatch(/metabalance-progress-\d{4}-\d{2}-\d{2}\.pdf/);
    
    // Verify PDF is base64 encoded
    expect(result.pdf.length).toBeGreaterThan(0);
    expect(() => Buffer.from(result.pdf, "base64")).not.toThrow();
    
    // Verify PDF starts with PDF magic number when decoded
    const pdfBuffer = Buffer.from(result.pdf, "base64");
    const pdfHeader = pdfBuffer.toString("ascii", 0, 4);
    expect(pdfHeader).toBe("%PDF");
  });

  it("PDF has valid structure and reasonable size", async () => {
    const ctx = createTestContext(testUserId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.exportPDF();
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    // Check PDF is valid and has reasonable size (>1KB for content)
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    
    // Check PDF structure markers
    const pdfHeader = pdfBuffer.toString("ascii", 0, 4);
    expect(pdfHeader).toBe("%PDF");
    
    // Check for EOF marker
    const pdfEnd = pdfBuffer.toString("ascii", pdfBuffer.length - 6, pdfBuffer.length);
    expect(pdfEnd).toContain("%%EOF");
  });
});
