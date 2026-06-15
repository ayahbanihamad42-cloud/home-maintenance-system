// import mysql from "mysql2";
// import dotenv from "dotenv";
// import fs from "fs";
// import path from "path";

// dotenv.config();

// function getSSLConfig() {
//   if (process.env.DB_SSL !== "true") {
//     return undefined;
//   }

//   if (!process.env.DB_CA_PATH) {
//     return { rejectUnauthorized: true };
//   }

//   const caPath = path.resolve(process.env.DB_CA_PATH);

//   if (!fs.existsSync(caPath)) {
//     console.warn("DB_CA_PATH not found. SSL will use default configuration.");
//     return { rejectUnauthorized: true };
//   }

//   return {
//     ca: fs.readFileSync(caPath),
//     rejectUnauthorized: true,
//   };
// }

// export const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT || 3306),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,

//   ssl: getSSLConfig(),
// });

// db.getConnection((err, connection) => {
//   if (err) {
//     console.error("DB connection failed:", err.message);
//     return;
//   }

//   console.log("DB connected successfully");
//   connection.release();
// });

import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures dotenv reads the .env file from the root backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function getSSLConfig() {
  if (process.env.DB_SSL !== "true") {
    return undefined;
  }

  if (!process.env.DB_CA_PATH) {
    return { rejectUnauthorized: true };
  }

  // Resolve path relative to the backend root directory
  const caPath = path.resolve(__dirname, "..", process.env.DB_CA_PATH);

  if (!fs.existsSync(caPath)) {
    console.warn(`DB_CA_PATH not found at: ${caPath}. SSL will use default configuration.`);
    return { rejectUnauthorized: true };
  }

  return {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  };
}

// Check if variables are loading correctly from your cloud profile
console.log(`[Database Config] Target Host: ${process.env.DB_HOST || "NOT LOADED"}`);

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
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
  console.log("DB connected successfully to TiDB Cloud!");
  connection.release();
});