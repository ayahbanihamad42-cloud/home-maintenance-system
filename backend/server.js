import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// اقرأ .env من داخل backend دائمًا
dotenv.config({ path: path.join(__dirname, ".env") });

// اختبار سريع
console.log("DB_USER =", process.env.DB_USER);
console.log("HAS_DB_PASSWORD =", !!process.env.DB_PASSWORD);

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
