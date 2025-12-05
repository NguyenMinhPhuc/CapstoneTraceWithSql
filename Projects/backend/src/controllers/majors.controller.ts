import { Request, Response } from "express";
import { majorsRepository } from "../repositories/majors.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const majorsController = {
  /**
   * Get all majors
   * GET /api/majors
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { department_id, is_active } = req.query;
    const departmentId = department_id
      ? parseInt(department_id as string)
      : undefined;
    const isActive =
      is_active === "true" ? true : is_active === "false" ? false : undefined;

    const majors = await majorsRepository.getAll(departmentId, isActive);
    res.json(majors);
  }),

  /**
   * Get major by ID
   * GET /api/majors/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const major = await majorsRepository.getById(parseInt(id));

    if (!major) {
      throw new AppError("Major not found", 404);
    }

    res.json(major);
  }),

  /**
   * Create new major
   * POST /api/majors
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const { code, name, description, department_id, is_active } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const major = await majorsRepository.create({
      code,
      name,
      description,
      department_id,
      is_active,
    });

    res.status(201).json(major);
  }),

  /**
   * Update major
   * PUT /api/majors/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { code, name, description, department_id, is_active } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const existing = await majorsRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Major not found", 404);
    }

    const major = await majorsRepository.update({
      id: parseInt(id),
      code,
      name,
      description,
      department_id,
      is_active,
    });

    res.json(major);
  }),

  /**
   * Delete major
   * DELETE /api/majors/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await majorsRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Major not found", 404);
    }

    await majorsRepository.delete(parseInt(id));
    res.status(204).send();
  }),
};
