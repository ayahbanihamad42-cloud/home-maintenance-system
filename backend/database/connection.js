import mysql from "mysql2";
import dotenv from "dotenv";

import oracledb from "oracledb";

export async function connectDB() {
  return await oracledb.getConnection({
    user: "YOUR_USERNAME",
    password: "YOUR_PASSWORD",
    connectString: "YOUR_DB_CONNECTION"
  });
}
// Attempt DB connection and log result
db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("DB connected successfully");
  }
});

export default db;
