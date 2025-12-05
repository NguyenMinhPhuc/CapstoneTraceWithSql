import express from "express";
import companiesController from "../controllers/companies.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// List and create companies (admin + manager)
router.get(
  "/",
  authenticate,
  authorize("admin", "manager"),
  companiesController.getAll
);
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  companiesController.create
);

// Single company
router.get(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  companiesController.getById
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  companiesController.update
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  companiesController.delete
);

export default router;
