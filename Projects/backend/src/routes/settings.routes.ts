import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  listSettings,
  getSetting,
  upsertSetting,
} from "../controllers/settings.controller";

const router = Router();

// Settings GET endpoints are public so the client can load theme/settings for all users.
// PUT remains admin-only.
router.get("/", listSettings);
router.get("/:key", getSetting);
router.put("/:key", authenticate, authorize("admin"), upsertSetting);

export default router;
