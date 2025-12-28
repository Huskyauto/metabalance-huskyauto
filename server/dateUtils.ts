/**
 * Date utility functions for database queries
 * Reduces code duplication across routers
 */

/**
 * Get start and end of day for a given date
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get start and end of week for a given date
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day; // Adjust to Sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get start and end of month for a given date
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get date range for the past N days
 */
export function getPastDaysRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  
  return { start, end };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}


/**
 * Build date range conditions for Drizzle queries
 * Reduces duplication of gte/lte logic across db.ts functions
 */
export function buildDateRange(startDate?: Date, endDate?: Date) {
  const conditions: any[] = [];
  
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    conditions.push({ gte: start });
  }
  
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push({ lte: end });
  }
  
  return conditions.length > 0 ? conditions : undefined;
}

/**
 * Normalize date to start of day (UTC)
 * Prevents timezone bugs in date comparisons
 */
export function normalizeToStartOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Normalize date to end of day (UTC)
 */
export function normalizeToEndOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
