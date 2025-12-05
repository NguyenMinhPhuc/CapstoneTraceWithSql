import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  addResourceLink,
  updateResourceLink,
  deleteResourceLink,
} from "../controllers/resources.controller";

const router = Router();

// Public routes - anyone can view resources
router.get("/", authenticate, listResources);
router.get("/:id", authenticate, getResource);

// Admin/Manager only routes
router.post("/", authenticate, authorize("admin", "manager"), createResource);
router.put("/:id", authenticate, authorize("admin", "manager"), updateResource);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  deleteResource
);

// Links management
router.post(
  "/:id/links",
  authenticate,
  authorize("admin", "manager"),
  addResourceLink
);
router.put(
  "/:id/links/:linkId",
  authenticate,
  authorize("admin", "manager"),
  updateResourceLink
);
router.delete(
  "/:id/links/:linkId",
  authenticate,
  authorize("admin", "manager"),
  deleteResourceLink
);

export default router;
