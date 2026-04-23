import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const caPath = "D:/gp1ayah/certs/tidb-ca.pem";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB pool connection failed:", err);
  } else {
    console.log("DB connected successfully");
    connection.release();
  }
});