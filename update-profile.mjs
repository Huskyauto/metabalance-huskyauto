#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import { metabolicProfiles } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function updateProfile() {
  try {
    console.log("Updating profile with correct values...\n");
    
    // Update the profile
    const result = await db
      .update(metabolicProfiles)
      .set({
        currentWeight: 317,
        targetWeight: 225,
      })
      .where(eq(metabolicProfiles.userId, 1));
    
    console.log("Update result:", result);
    
    // Verify the update
    const updated = await db.select().from(metabolicProfiles);
    console.log("\nUpdated profile:", updated[0]);
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating profile:", error);
    process.exit(1);
  }
}

updateProfile();
