import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT userId, currentWeight, targetWeight, height, age, gender, activityLevel FROM metabolic_profiles WHERE userId = 1');
console.log('Profile data:', rows[0]);
await connection.end();
