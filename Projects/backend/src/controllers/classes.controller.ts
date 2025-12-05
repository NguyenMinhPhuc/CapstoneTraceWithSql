import { Request, Response } from "express";
import { classesRepository } from "../repositories/classes.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const classesController = {
  /**
   * Get all classes
   * GET /api/classes
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { major_id, academic_year, is_active } = req.query;
    const majorId = major_id ? parseInt(major_id as string) : undefined;
    const isActive =
      is_active === "true" ? true : is_active === "false" ? false : undefined;

    const classes = await classesRepository.getAll(
      majorId,
      academic_year as string,
      isActive
    );
    res.json(classes);
  }),

  /**
   * Get class by ID
   * GET /api/classes/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const classData = await classesRepository.getById(parseInt(id));

    if (!classData) {
      throw new AppError("Class not found", 404);
    }

    res.json(classData);
  }),

  /**
   * Create new class
   * POST /api/classes
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const { code, name, major_id, academic_year, is_active } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const classData = await classesRepository.create({
      code,
      name,
      major_id,
      academic_year,
      is_active,
    });

    res.status(201).json(classData);
  }),

  /**
   * Update class
   * PUT /api/classes/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { code, name, major_id, academic_year, is_active } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const existing = await classesRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Class not found", 404);
    }

    const classData = await classesRepository.update({
      id: parseInt(id),
      code,
      name,
      major_id,
      academic_year,
      is_active,
    });

    res.json(classData);
  }),

  /**
   * Delete class
   * DELETE /api/classes/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await classesRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Class not found", 404);
    }

    await classesRepository.delete(parseInt(id));
    res.status(204).send();
  }),
};
