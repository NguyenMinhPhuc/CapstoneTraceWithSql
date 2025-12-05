import { Router } from "express";
import { classesController } from "../controllers/classes.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/classes - Get all classes
router.get("/", classesController.getAll);

// GET /api/classes/:id - Get class by ID
router.get("/:id", classesController.getById);

// POST /api/classes - Create new class (admin/manager only)
router.post("/", authorize("admin", "manager"), classesController.create);

// PUT /api/classes/:id - Update class (admin/manager only)
router.put("/:id", authorize("admin", "manager"), classesController.update);

// DELETE /api/classes/:id - Delete class (admin only)
router.delete("/:id", authorize("admin"), classesController.delete);

export default router;
