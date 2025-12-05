import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { supervisorsController } from "../controllers/supervisors.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "manager"),
  supervisorsController.getAll
);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  supervisorsController.create
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  supervisorsController.getById
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  supervisorsController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  supervisorsController.delete
);

export default router;
