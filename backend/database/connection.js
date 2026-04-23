import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار ملف الشهادة
const caPath = "D:/gp1ayah/certs/tidb-ca.pem";

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected successfully");
  }
});