import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

function getSSLConfig() {
  if (process.env.DB_SSL !== "true") {
    return undefined;
  }

  if (!process.env.DB_CA_PATH) {
    return { rejectUnauthorized: true };
  }

  const caPath = path.resolve(process.env.DB_CA_PATH);

  if (!fs.existsSync(caPath)) {
    console.warn("DB_CA_PATH not found. SSL will use default configuration.");
    return { rejectUnauthorized: true };
  }

  return {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  };
}

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: getSSLConfig(),
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection failed:", err.message);
    return;
  }

  console.log("DB connected successfully");
  connection.release();
});