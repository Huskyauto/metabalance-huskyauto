import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const profiles = await db.select().from(schema.metabolicProfiles).where(schema.metabolicProfiles.userId.eq(1));
console.log(JSON.stringify(profiles, null, 2));

await connection.end();
