import express from "express";
import { getAllTechnicians,getAllUsers } from "../controllers/adminController.js";
const router = express.Router();    
router.get("/technicians", getAllTechnicians);
router.get("/users", getAllUsers);
export default router;