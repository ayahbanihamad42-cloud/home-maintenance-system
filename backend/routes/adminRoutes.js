import express from "express";
import {
  createTechnician,
  createUser,
  deleteTechnician,
  deleteUser,
  getAllTechnicians,
  getAllUsers
} from "../controllers/adminController.js";
// Create router for admin routes
const router = express.Router();    
// Fetch all technicians
router.get("/technicians", getAllTechnicians);
// Fetch all technicians
router.get("/users", getAllUsers);
 //Create a new user
router.post("/users", createUser);
// Create a new technician
router.post("/technicians", createTechnician);
// Delete a user
router.delete("/users/:id", deleteUser);
// Delete a technician
router.delete("/technicians/:id", deleteTechnician);
export default router;
