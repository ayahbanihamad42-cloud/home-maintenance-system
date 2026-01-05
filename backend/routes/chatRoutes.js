import express from "express"; 
import * as chat from "../controllers/chatController.js";
import auth from "../utils/authMiddleware.js";
const router = express.Router();
router.get("/:userId", auth, chat.getMessages);
router.post("/", auth, chat.sendMessage);

export default router;
