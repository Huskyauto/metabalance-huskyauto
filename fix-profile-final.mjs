#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import { metabolicProfiles } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function fixProfile() {
  try {
    console.log("Updating profile with correct values...");
    
    const result = await db.update(metabolicProfiles)
      .set({
        currentWeight: 317,
        targetWeight: 225,
        updatedAt: new Date()
      })
      .where(eq(metabolicProfiles.userId, 1));
    
    console.log("Update result:", result);
    
    // Verify the update
    const updated = await db.select().from(metabolicProfiles).where(eq(metabolicProfiles.userId, 1)).limit(1);
    console.log("\nVerified profile data:");
    console.log("Current Weight:", updated[0]?.currentWeight);
    console.log("Target Weight:", updated[0]?.targetWeight);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixProfile();
