import { Router } from "express";
import { studentsController } from "../controllers/students.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/students - Get all students
router.get("/", studentsController.getAll);

// GET /api/students/:id - Get student by ID
router.get("/:id", studentsController.getById);

// POST /api/students - Create new student (admin, manager only)
router.post("/", authorize("admin", "manager"), studentsController.create);

// PUT /api/students/:id - Update student (admin, manager only)
router.put("/:id", authorize("admin", "manager"), studentsController.update);

// DELETE /api/students/:id - Delete student (admin only)
router.delete("/:id", authorize("admin"), studentsController.delete);

export default router;
