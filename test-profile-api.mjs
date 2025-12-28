#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import { metabolicProfiles, users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function testProfileAPI() {
  try {
    // Get user ID
    const userList = await db.select().from(users);
    console.log("Users:", userList);
    
    const userId = userList[0]?.id;
    if (!userId) {
      console.log("No users found");
      return;
    }
    
    // Get profile using the same query as the API
    const result = await db.select().from(metabolicProfiles).where(eq(metabolicProfiles.userId, userId)).limit(1);
    console.log("\nProfile query result:");
    console.log(JSON.stringify(result[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testProfileAPI();
