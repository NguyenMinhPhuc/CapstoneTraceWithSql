import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  listRubrics,
  getRubric,
  createRubric,
  updateRubric,
  deleteRubric,
  addCriterion,
  updateCriterion,
  deleteCriterion,
} from "../controllers/rubrics.controller";

const router = Router();

router.use(authenticate);

router.get("/", listRubrics);
router.get("/:id", getRubric);

router.post("/", authorize("admin", "manager"), createRubric);
router.put("/:id", authorize("admin", "manager"), updateRubric);
router.delete("/:id", authorize("admin", "manager"), deleteRubric);

router.post("/:id/criteria", authorize("admin", "manager"), addCriterion);
router.put(
  "/:id/criteria/:criterionId",
  authorize("admin", "manager"),
  updateCriterion
);
router.delete(
  "/:id/criteria/:criterionId",
  authorize("admin", "manager"),
  deleteCriterion
);

export default router;
