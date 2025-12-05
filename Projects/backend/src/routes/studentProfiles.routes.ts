import express from "express";
import { studentProfilesController } from "../controllers/studentProfiles.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Any authenticated user can view their profile; admin/manager can manage
router.get(
  "/student/:studentId",
  authenticate,
  studentProfilesController.getByStudentId
);

// Admin/manager or student (owner) can create/update/delete their profile
router.post("/", authenticate, studentProfilesController.create);
// Allow admin/manager or student (if owner) to update
router.put("/:id", authenticate, studentProfilesController.update);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  studentProfilesController.delete
);

export default router;
