import { users, type User, type InsertUser } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(openId: string): Promise<User | undefined>;
  upsertUser(userData: { id: string; email?: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(openId: string): Promise<User | undefined> {
    const db = await getDb();
    if (!db) return undefined;
    
    const [user] = await db.select().from(users).where(eq(users.openId, openId));
    return user;
  }

  async upsertUser(userData: { id: string; email?: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null }): Promise<User> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await this.getUser(userData.id);
    
    const name = [userData.firstName, userData.lastName].filter(Boolean).join(" ") || null;
    
    if (existing) {
      await db.update(users)
        .set({
          name,
          email: userData.email ?? existing.email,
          lastSignedIn: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.openId, userData.id));
      
      const [updated] = await db.select().from(users).where(eq(users.openId, userData.id));
      return updated;
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          openId: userData.id,
          name,
          email: userData.email,
          loginMethod: "replit",
          lastSignedIn: new Date(),
        })
        .returning();
      return newUser;
    }
  }
}

export const authStorage = new AuthStorage();
