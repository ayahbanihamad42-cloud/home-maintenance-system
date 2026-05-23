import express from "express";
import * as tech from "../controllers/technicianController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/smart-search", tech.smartTechnicianSearch);
router.get("/service/:service", tech.getTechniciansByService);

router.get("/availability/my", auth, tech.getMyAvailability);
router.post("/availability", auth, tech.createAvailability);
router.delete("/availability/:id", auth, tech.deleteAvailability);

router.get("/regular-availability/my", auth, tech.getMyRegularAvailability);
router.post("/regular-availability", auth, tech.createRegularAvailability);
router.delete("/regular-availability/:id", auth, tech.deleteRegularAvailability);

router.get("/requests/my", auth, tech.getMyRequests);
router.put("/requests/:requestId/status", auth, tech.updateRequestStatus);

router.get("/gallery/my", auth, tech.getMyGallery);
router.post("/gallery", auth, tech.createGalleryPost);
router.put("/gallery/:postId", auth, tech.updateGalleryPost);
router.delete("/gallery/:postId", auth, tech.deleteGalleryPost);

router.get("/:id/gallery", tech.getTechnicianGallery);
router.get("/:id/availability", tech.getAvailabilityByTechnician);

router.get("/user/:userId", tech.getTechnicianByUserId);
router.put("/price", auth, tech.updateTechnicianPrice);

router.get("/:id", tech.getTechnicianById);

export default router;