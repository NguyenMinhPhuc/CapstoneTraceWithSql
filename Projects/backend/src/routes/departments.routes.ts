import { Router } from "express";
import { departmentsController } from "../controllers/departments.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/departments - Get all departments
router.get("/", departmentsController.getAll);

// GET /api/departments/:id - Get department by ID
router.get("/:id", departmentsController.getById);

// POST /api/departments - Create new department (admin/manager only)
router.post("/", authorize("admin", "manager"), departmentsController.create);

// PUT /api/departments/:id - Update department (admin/manager only)
router.put("/:id", authorize("admin", "manager"), departmentsController.update);

// DELETE /api/departments/:id - Delete department (admin only)
router.delete("/:id", authorize("admin"), departmentsController.delete);

export default router;
