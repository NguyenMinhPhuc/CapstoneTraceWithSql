import express from "express";
import { authenticate } from "../middleware/auth";
import internshipPositionsController from "../controllers/internshipPositions.controller";

const router = express.Router();

// List positions for a defense session
router.get(
  "/sessions/:sessionId/positions",
  authenticate,
  internshipPositionsController.getByPeriod
);

// Get a single position by ID
router.get(
  "/positions/:id",
  authenticate,
  internshipPositionsController.getById
);

// Create a position for a defense session
router.post(
  "/sessions/:sessionId/positions",
  authenticate,
  internshipPositionsController.create
);

// Update a position by ID
router.put(
  "/positions/:id",
  authenticate,
  internshipPositionsController.update
);

// Delete a position by ID
router.delete(
  "/positions/:id",
  authenticate,
  internshipPositionsController.delete
);

export default router;
