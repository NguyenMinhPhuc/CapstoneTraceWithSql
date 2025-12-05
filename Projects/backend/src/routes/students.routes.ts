import { Router } from "express";
import { studentsController } from "../controllers/students.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/students - Get all students
router.get("/", studentsController.getAll);
// Export students CSV
router.get("/export", studentsController.export);
// Stats for dashboard/cards
router.get("/stats", studentsController.stats);
// Get all status history (admin reporting)
router.get(
  "/history/all",
  authorize("admin", "manager"),
  studentsController.getAllStatusHistory
);

// GET /api/students/:id - Get student by ID
router.get("/:id", studentsController.getById);
// Get status history for a student
router.get("/:id/status-history", studentsController.getStatusHistory);
// Add status history record manually
router.post(
  "/:id/status-history",
  authorize("admin", "manager"),
  studentsController.addStatusHistory
);

// POST /api/students - Create new student (admin, manager only)
router.post("/", authorize("admin", "manager"), studentsController.create);

// PUT /api/students/:id - Update student (admin, manager only)
router.put("/:id", authorize("admin", "manager"), studentsController.update);

// DELETE /api/students/:id - Delete student (admin only)
router.delete("/:id", authorize("admin"), studentsController.delete);

export default router;
