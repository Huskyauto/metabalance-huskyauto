#!/usr/bin/env node
import { drizzle } from "drizzle-orm/mysql2";
import { supplements, users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const SUPPLEMENTS_TO_ADD = [
  {
    name: "Berberine",
    type: "berberine",
    dosage: "500mg, 2-3 times daily",
    frequency: "2-3 times daily",
    timing: "Before meals",
    notes: "Improves insulin sensitivity, activates AMPK, supports weight loss. May cause digestive upset initially - start with lower dose.",
  },
  {
    name: "Probiotics (Multi-strain)",
    type: "probiotic",
    dosage: "10-50 billion CFU daily",
    frequency: "Once daily",
    timing: "With or without food",
    notes: "Improves gut microbiome diversity, reduces inflammation, enhances metabolic health. Look for refrigerated products with multiple strains.",
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    type: "nmn",
    dosage: "250-500mg daily",
    frequency: "Once daily",
    timing: "Morning, on empty stomach",
    notes: "Boosts NAD+ levels for cellular energy, improves mitochondrial function, may reverse metabolic aging.",
  },
  {
    name: "Resveratrol",
    type: "resveratrol",
    dosage: "150-500mg daily",
    frequency: "Once daily",
    timing: "With meals (improves absorption)",
    notes: "Activates sirtuins (longevity genes), improves mitochondrial function, anti-inflammatory. Look for micronized or liposomal forms.",
  },
  {
    name: "Omega-3 (EPA/DHA)",
    type: "other",
    dosage: "1-2g EPA+DHA daily",
    frequency: "Once daily",
    timing: "With meals",
    notes: "Balances omega-6 to omega-3 ratio, reduces inflammation, supports heart health. Choose high-quality fish oil or algae-based omega-3.",
  },
  {
    name: "Vitamin D3",
    type: "other",
    dosage: "2000-5000 IU daily",
    frequency: "Once daily",
    timing: "With fatty meal",
    notes: "Supports metabolic health, improves insulin sensitivity, reduces inflammation. Get blood levels tested - optimal range is 40-60 ng/mL.",
  },
  {
    name: "Magnesium",
    type: "other",
    dosage: "300-400mg daily",
    frequency: "Once daily",
    timing: "Evening (may promote relaxation)",
    notes: "Improves insulin sensitivity, supports energy production, reduces stress and improves sleep. Magnesium glycinate or citrate are well-absorbed forms.",
  },
];

async function seedSupplements() {
  try {
    console.log("🌱 Starting supplement seeding...\n");

    // Get all users
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.log("❌ No users found in database. Please create a user account first.");
      process.exit(1);
    }

    console.log(`Found ${allUsers.length} user(s) in database.\n`);

    // Add supplements for each user
    for (const user of allUsers) {
      console.log(`Adding supplements for user: ${user.name || user.email || user.openId}`);
      
      for (const supplement of SUPPLEMENTS_TO_ADD) {
        // Check if supplement already exists for this user
        const existing = await db
          .select()
          .from(supplements)
          .where(eq(supplements.userId, user.id))
          .where(eq(supplements.name, supplement.name))
          .limit(1);

        if (existing.length > 0) {
          console.log(`  ⏭️  ${supplement.name} - already exists, skipping`);
          continue;
        }

        await db.insert(supplements).values({
          userId: user.id,
          name: supplement.name,
          type: supplement.type,
          dosage: supplement.dosage,
          frequency: supplement.frequency,
          timing: supplement.timing,
          startDate: new Date(),
          isActive: true,
          notes: supplement.notes,
        });

        console.log(`  ✅ ${supplement.name} - added successfully`);
      }
      
      console.log("");
    }

    console.log("✨ Supplement seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding supplements:", error);
    process.exit(1);
  }
}

seedSupplements();
