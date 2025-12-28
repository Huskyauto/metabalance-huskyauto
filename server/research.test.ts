import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Research Content Storage', () => {
  let testUserId: number; // Test user ID to avoid interfering with real data
  
  beforeAll(async () => {
    // Create test user if it doesn't exist (required for foreign key constraint)
    await db.upsertUser({
      openId: 'test-research-user-999999',
      name: 'Test Research User',
      email: 'test-research@example.com',
      loginMethod: 'test',
      role: 'user',
      lastSignedIn: new Date(),
    });
    
    // Get the actual user ID
    const user = await db.getUserByOpenId('test-research-user-999999');
    if (!user) throw new Error('Failed to create test user');
    testUserId = user.id;
    
    // Clean up any existing test research content
    const history = await db.getResearchHistory(testUserId, undefined, 100);
    console.log(`[TEST SETUP] Found ${history.length} existing test research entries`);
  });

  it('saves research content to database', async () => {
    const testContent = {
      userId: testUserId,
      category: 'overview' as const,
      content: '# Test Research Content\n\nThis is a test of automatic research storage.',
      generatedAt: new Date(),
    };

    await db.saveResearchContent(testContent);
    
    const history = await db.getResearchHistory(testUserId, 'overview', 1);
    
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].userId).toBe(testUserId);
    expect(history[0].category).toBe('overview');
    expect(history[0].content).toContain('Test Research Content');
  });

  it('retrieves research history by category', async () => {
    // Save multiple categories
    await db.saveResearchContent({
      userId: testUserId,
      category: 'glp1',
      content: 'GLP-1 test content',
      generatedAt: new Date(),
    });
    
    await db.saveResearchContent({
      userId: testUserId,
      category: 'fasting',
      content: 'Fasting test content',
      generatedAt: new Date(),
    });

    const glp1History = await db.getResearchHistory(testUserId, 'glp1', 5);
    const fastingHistory = await db.getResearchHistory(testUserId, 'fasting', 5);
    
    expect(glp1History.length).toBeGreaterThan(0);
    expect(fastingHistory.length).toBeGreaterThan(0);
    expect(glp1History[0].category).toBe('glp1');
    expect(fastingHistory[0].category).toBe('fasting');
  });

  it('retrieves all research history without category filter', async () => {
    const allHistory = await db.getResearchHistory(testUserId, undefined, 10);
    
    expect(allHistory.length).toBeGreaterThan(0);
    
    // Should contain multiple categories
    const categories = new Set(allHistory.map(r => r.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('gets latest research by category', async () => {
    const latest = await db.getLatestResearchByCategory(testUserId, 'overview');
    
    expect(latest).toBeDefined();
    expect(latest?.category).toBe('overview');
    expect(latest?.userId).toBe(testUserId);
  });

  it('marks research as viewed', async () => {
    // Save new research
    await db.saveResearchContent({
      userId: testUserId,
      category: 'nutrition',
      content: 'Nutrition test content',
      generatedAt: new Date(),
    });
    
    const latest = await db.getLatestResearchByCategory(testUserId, 'nutrition');
    expect(latest).toBeDefined();
    expect(latest!.viewed).toBe(false);
    
    // Mark as viewed
    await db.markResearchViewed(latest!.id, testUserId);
    
    const updated = await db.getLatestResearchByCategory(testUserId, 'nutrition');
    expect(updated!.viewed).toBe(true);
    expect(updated!.viewedAt).toBeDefined();
  });

  it('toggles research bookmark', async () => {
    // Save new research
    await db.saveResearchContent({
      userId: testUserId,
      category: 'exercise',
      content: 'Exercise test content',
      generatedAt: new Date(),
    });
    
    const latest = await db.getLatestResearchByCategory(testUserId, 'exercise');
    expect(latest).toBeDefined();
    expect(latest!.bookmarked).toBe(false);
    
    // Bookmark it
    await db.toggleResearchBookmark(latest!.id, testUserId, true);
    
    const bookmarked = await db.getLatestResearchByCategory(testUserId, 'exercise');
    expect(bookmarked!.bookmarked).toBe(true);
    
    // Unbookmark it
    await db.toggleResearchBookmark(latest!.id, testUserId, false);
    
    const unbookmarked = await db.getLatestResearchByCategory(testUserId, 'exercise');
    expect(unbookmarked!.bookmarked).toBe(false);
  });

  it('respects limit parameter in history retrieval', async () => {
    // Save multiple entries
    for (let i = 0; i < 5; i++) {
      await db.saveResearchContent({
        userId: testUserId,
        category: 'metabolic',
        content: `Metabolic test content ${i}`,
        generatedAt: new Date(),
      });
    }
    
    const limited = await db.getResearchHistory(testUserId, 'metabolic', 3);
    expect(limited.length).toBeLessThanOrEqual(3);
  });

  it('returns research in reverse chronological order', async () => {
    const history = await db.getResearchHistory(testUserId, undefined, 10);
    
    if (history.length > 1) {
      for (let i = 0; i < history.length - 1; i++) {
        const current = new Date(history[i].generatedAt).getTime();
        const next = new Date(history[i + 1].generatedAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
});
