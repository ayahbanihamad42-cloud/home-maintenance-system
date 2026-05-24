import express from "express";
import * as tech from "../controllers/technicianController.js";
import auth from "../utils/authMiddleware.js";
import requireRole from "../utils/requireRole.js";

const router = express.Router();

router.post("/smart-search", tech.smartTechnicianSearch);
router.get("/service/:service", tech.getTechniciansByService);

router.get("/availability/my", auth, requireRole("technician"), tech.getMyAvailability);
router.post("/availability", auth, requireRole("technician"), tech.createAvailability);
router.delete("/availability/:id", auth, requireRole("technician"), tech.deleteAvailability);

router.get("/regular-availability/my", auth, requireRole("technician"), tech.getMyRegularAvailability);
router.post("/regular-availability", auth, requireRole("technician"), tech.createRegularAvailability);
router.delete("/regular-availability/:id", auth, requireRole("technician"), tech.deleteRegularAvailability);

router.get("/requests/my", auth, requireRole("technician"), tech.getMyRequests);
router.put("/requests/:requestId/status", auth, requireRole("technician"), tech.updateRequestStatus);

router.get("/gallery/my", auth, requireRole("technician"), tech.getMyGallery);
router.post("/gallery", auth, requireRole("technician"), tech.createGalleryPost);
router.put("/gallery/:postId", auth, requireRole("technician"), tech.updateGalleryPost);
router.delete("/gallery/:postId", auth, requireRole("technician"), tech.deleteGalleryPost);

router.put("/price", auth, requireRole("technician"), tech.updateTechnicianPrice);

router.get("/:id/gallery", tech.getTechnicianGallery);
router.get("/:id/availability", tech.getAvailabilityByTechnician);
router.get("/user/:userId", tech.getTechnicianByUserId);
router.get("/:id", tech.getTechnicianById);

export default router;