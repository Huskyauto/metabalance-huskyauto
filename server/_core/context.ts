import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const userId = (opts.req.session as any)?.userId;
    if (userId) {
      const db = await getDb();
      if (db) {
        const [foundUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        user = foundUser || null;
      }
    }
  } catch (error) {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
