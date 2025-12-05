import { Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { RubricsRepository } from "../repositories/rubrics.repository";

const VALID_RUBRIC_TYPES = [
  "supervisor",
  "council",
  "reviewer",
  "early_internship",
];

export const listRubrics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, pageSize, rubric_type, search, isActive } = req.query as any;
    const data = await RubricsRepository.listRubrics({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
      rubric_type: rubric_type || undefined,
      search: search || undefined,
      isActive: typeof isActive === "string" ? isActive === "true" : undefined,
    });

    res.status(200).json({ success: true, data });
  }
);

export const getRubric = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const rubric = await RubricsRepository.getRubricById(id);
    if (!rubric) throw new AppError("Rubric not found", 404);
    res.status(200).json({ success: true, data: rubric });
  }
);

export const createRubric = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, rubric_type, description, total_score, is_active } = req.body;
    if (!name || !rubric_type) {
      throw new AppError("Name and rubric_type are required", 400);
    }
    if (!VALID_RUBRIC_TYPES.includes(rubric_type)) {
      throw new AppError("Invalid rubric_type", 400);
    }

    const id = await RubricsRepository.createRubric({
      name,
      rubric_type,
      description,
      total_score,
      is_active,
    });

    res.status(201).json({ success: true, data: { id } });
  }
);

export const updateRubric = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, rubric_type, description, total_score, is_active } = req.body;
    if (!name || !rubric_type)
      throw new AppError("Name and rubric_type are required", 400);
    if (!VALID_RUBRIC_TYPES.includes(rubric_type))
      throw new AppError("Invalid rubric_type", 400);
    const ok = await RubricsRepository.updateRubric(id, {
      name,
      rubric_type,
      description,
      total_score,
      is_active,
    });
    if (!ok) throw new AppError("Rubric not found", 404);
    res.status(200).json({ success: true });
  }
);

export const deleteRubric = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const ok = await RubricsRepository.deleteRubric(id);
    if (!ok) throw new AppError("Rubric not found", 404);
    res.status(200).json({ success: true });
  }
);

export const addCriterion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const rubric_id = parseInt(req.params.id);
    const { name, description, max_score, weight, order_index, PLO, PI, CLO } =
      req.body;
    if (!name || max_score === undefined)
      throw new AppError("name and max_score are required", 400);
    const id = await RubricsRepository.addCriterion({
      rubric_id,
      name,
      description,
      PLO: PLO ?? null,
      PI: PI ?? null,
      CLO: CLO ?? null,
      max_score,
      weight,
      order_index,
    });
    res.status(201).json({ success: true, data: { id } });
  }
);

export const updateCriterion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const criterionId = parseInt(req.params.criterionId);
    const { name, description, max_score, weight, order_index, PLO, PI, CLO } =
      req.body;
    if (!name || max_score === undefined)
      throw new AppError("name and max_score are required", 400);
    const ok = await RubricsRepository.updateCriterion(criterionId, {
      name,
      description,
      PLO: PLO ?? null,
      PI: PI ?? null,
      CLO: CLO ?? null,
      max_score,
      weight,
      order_index,
    });
    if (!ok) throw new AppError("Criterion not found", 404);
    res.status(200).json({ success: true });
  }
);

export const deleteCriterion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const criterionId = parseInt(req.params.criterionId);
    const ok = await RubricsRepository.deleteCriterion(criterionId);
    if (!ok) throw new AppError("Criterion not found", 404);
    res.status(200).json({ success: true });
  }
);
