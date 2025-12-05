import { Router } from "express";
import { majorsController } from "../controllers/majors.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/majors - Get all majors
router.get("/", majorsController.getAll);

// GET /api/majors/:id - Get major by ID
router.get("/:id", majorsController.getById);

// POST /api/majors - Create new major (admin/manager only)
router.post("/", authorize("admin", "manager"), majorsController.create);

// PUT /api/majors/:id - Update major (admin/manager only)
router.put("/:id", authorize("admin", "manager"), majorsController.update);

// DELETE /api/majors/:id - Delete major (admin only)
router.delete("/:id", authorize("admin"), majorsController.delete);

export default router;
