import { Router } from "express";
import { classAdvisorsController } from "../controllers/classAdvisors.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/class-advisors - Get all class advisors with filters
router.get("/", classAdvisorsController.getAll);

// GET /api/class-advisors/history/:classId - Get assignment history for a class
router.get("/history/:classId", classAdvisorsController.getHistory);

// GET /api/class-advisors/profiles - Get advisor profiles
router.get("/profiles", classAdvisorsController.getProfiles);

// POST /api/class-advisors - Assign class advisor (admin, manager only)
router.post("/", authorize("admin", "manager"), classAdvisorsController.assign);

// POST /api/class-advisors/profiles - Add advisor profile (admin, manager, supervisor)
router.post(
  "/profiles",
  authorize("admin", "manager", "supervisor"),
  classAdvisorsController.addProfile
);

// PUT /api/class-advisors/:id - Update class advisor (admin, manager only)
router.put(
  "/:id",
  authorize("admin", "manager"),
  classAdvisorsController.update
);

// DELETE /api/class-advisors/:id - Delete class advisor (admin only)
router.delete("/:id", authorize("admin"), classAdvisorsController.delete);

export default router;
