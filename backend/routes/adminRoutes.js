import express from "express";
import {
  createTechnician,
  createUser,
  deleteTechnician,
  deleteUser,
  getAllTechnicians,
  getAllUsers
} from "../controllers/adminController.js";
const router = express.Router();    
router.get("/technicians", getAllTechnicians);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.post("/technicians", createTechnician);
router.delete("/users/:id", deleteUser);
router.delete("/technicians/:id", deleteTechnician);
export default router;
