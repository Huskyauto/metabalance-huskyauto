#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import { metabolicProfiles } from '../drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function updateProfile() {
  const connection = await createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log('Updating metabolic profile with correct weight values...');
    
    const result = await db
      .update(metabolicProfiles)
      .set({
        currentWeight: 317,
        targetWeight: 225,
        primaryGoal: 'Lose 92 lbs through metabolic optimization',
        updatedAt: new Date()
      })
      .where(eq(metabolicProfiles.userId, 1));

    console.log('Update result:', result);
    console.log('✅ Profile updated successfully!');
    console.log('Current Weight: 317 lbs');
    console.log('Target Weight: 225 lbs');
    console.log('To Go: 92 lbs');

    // Verify the update
    const [profile] = await db
      .select()
      .from(metabolicProfiles)
      .where(eq(metabolicProfiles.userId, 1));

    console.log('\nVerified profile data:');
    console.log(`Current Weight: ${profile.currentWeight} lbs`);
    console.log(`Target Weight: ${profile.targetWeight} lbs`);
    console.log(`Goal: ${profile.primaryGoal}`);

  } catch (error) {
    console.error('Error updating profile:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateProfile();
