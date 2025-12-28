import { drizzle } from "drizzle-orm/mysql2";
import { users, metabolicProfiles } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const allUsers = await db.select().from(users);
console.log("Users:", JSON.stringify(allUsers, null, 2));

const allProfiles = await db.select().from(metabolicProfiles);
console.log("\nMetabolic Profiles:", JSON.stringify(allProfiles, null, 2));
