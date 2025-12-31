import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { defenseController } from "../controllers/defense.controller";

const router = Router();

// Get session types
router.get("/session-types", authenticate, defenseController.getSessionTypes);

// Get rubrics
router.get("/rubrics", authenticate, defenseController.getRubrics);

router.get(
  "/sessions",
  authenticate,
  // optional filters: session_type, status
  defenseController.getAll
);

router.post(
  "/sessions",
  authenticate,
  authorize("admin"),
  defenseController.create
);

router.get("/sessions/:id", authenticate, defenseController.getById);

router.put(
  "/sessions/:id",
  authenticate,
  authorize("admin"),
  defenseController.update
);

router.delete(
  "/sessions/:id",
  authenticate,
  authorize("admin"),
  defenseController.delete
);

// Registrations: list and create per session
router.get(
  "/sessions/:sessionId/registrations",
  authenticate,
  defenseController.getRegistrationsBySession
);

router.post(
  "/sessions/:sessionId/registrations",
  authenticate,
  authorize("admin"),
  defenseController.createRegistration
);

// Student self-registration (authenticated students)
router.post(
  "/sessions/:sessionId/registrations/me",
  authenticate,
  defenseController.createRegistrationForCurrentUser
);

// Get current student's registration (for ongoing session)
router.get(
  "/registrations/me",
  authenticate,
  defenseController.getRegistrationForCurrentUser
);

// Delete a registration
router.delete(
  "/registrations/:id",
  authenticate,
  authorize("admin"),
  defenseController.deleteRegistration
);

// Update a registration (statuses / notes)
router.put(
  "/registrations/:id",
  authenticate,
  authorize("admin"),
  defenseController.updateRegistration
);

export default router;
