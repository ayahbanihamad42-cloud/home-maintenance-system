// Load environment variables from a .env file
import dotenv from "dotenv";

// Import path utilities
import path from "path";

// Import utility to convert file URL to file path (ES modules compatibility)
import { fileURLToPath } from "url";

// Get the current file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current file
const __dirname = path.dirname(__filename);

// Always load the .env file from the backend directory
dotenv.config({ path: path.join(__dirname, ".env") });

// Quick test logs to ensure environment variables are loaded correctly
console.log("DB_USER =", process.env.DB_USER);
console.log("HAS_DB_PASSWORD =", !!process.env.DB_PASSWORD);

// Import the Express application
import app from "./app.js";

// Define the port (use environment variable or default to 5000)
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});


