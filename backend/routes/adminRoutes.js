import express from "express";

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

/* Users */
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

/* Technicians */
router.get("/technicians", getAllTechnicians);
router.post("/technicians", createTechnician);
router.delete("/technicians/:id", deleteTechnician);

/* Stores */
router.get("/stores", getAllStores);
router.post("/stores", createStore);
router.delete("/stores/:id", deleteStore);

/* Services */
router.get("/services", getAllServices);
router.post("/services", createService);
router.delete("/services/:id", deleteService);

export default router;