import express from "express"; 
import * as chat from "../controllers/chatController.js";
import auth from "../utils/authMiddleware.js";
// Create router for chat routes
const router = express.Router();

// Fetch user messages
router.get("/:userId", auth, chat.getMessages);
//Send a new message
router.post("/", auth, chat.sendMessage);

export default router;
