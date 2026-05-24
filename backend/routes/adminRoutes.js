import express from "express";
import auth from "../utils/authMiddleware.js";
import requireRole from "../utils/requireRole.js";

import {
  getAllUsers,
  createUser,
  deleteUser,
  getAllTechnicians,
  createTechnician,
  deleteTechnician,
  getAllStores,
  createStore,
  deleteStore,
  getAllServices,
  createService,
  deleteService,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(auth);
router.use(requireRole("admin"));

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

router.get("/technicians", getAllTechnicians);
router.post("/technicians", createTechnician);
router.delete("/technicians/:id", deleteTechnician);

router.get("/stores", getAllStores);
router.post("/stores", createStore);
router.delete("/stores/:id", deleteStore);

router.get("/services", getAllServices);
router.post("/services", createService);
router.delete("/services/:id", deleteService);

export default router;