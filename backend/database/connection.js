import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();
// Create database connection using .env settings
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// Attempt DB connection and log result
db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected successfully");
  }
});

export default db;
