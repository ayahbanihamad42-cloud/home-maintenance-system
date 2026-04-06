import express from "express";
import auth from "../utils/authMiddleware.js";
import requireRole from "../utils/requireRole.js";
import {
  createTechnician,
  createUser,
  deleteTechnician,
  deleteUser,
  getAllTechnicians,
  getAllUsers
} from "../controllers/adminController.js";

const router = express.Router();
// All routes in this router require authentication and admin role
router.use(auth, requireRole("admin"));
//fetch all technicians and users
router.get("/technicians", getAllTechnicians);
router.get("/users", getAllUsers);
//create technician and user accaounts and delete them
router.post("/users", createUser);
router.post("/technicians", createTechnician);
router.delete("/users/:id", deleteUser);
router.delete("/technicians/:id", deleteTechnician);

export default router;