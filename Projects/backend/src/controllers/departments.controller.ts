import { Request, Response } from "express";
import { departmentsRepository } from "../repositories/departments.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";

export const departmentsController = {
  /**
   * Get all departments
   * GET /api/departments
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { is_active } = req.query;
    const isActive =
      is_active === "true" ? true : is_active === "false" ? false : undefined;

    const departments = await departmentsRepository.getAll(isActive);
    res.json(departments);
  }),

  /**
   * Get department by ID
   * GET /api/departments/:id
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await departmentsRepository.getById(parseInt(id));

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    res.json(department);
  }),

  /**
   * Create new department
   * POST /api/departments
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const {
      code,
      name,
      description,
      head_name,
      head_email,
      head_phone,
      is_active,
    } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const department = await departmentsRepository.create({
      code,
      name,
      description,
      head_name,
      head_email,
      head_phone,
      is_active,
    });

    res.status(201).json(department);
  }),

  /**
   * Update department
   * PUT /api/departments/:id
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      head_name,
      head_email,
      head_phone,
      is_active,
    } = req.body;

    if (!code || !name) {
      throw new AppError("Code and name are required", 400);
    }

    const existing = await departmentsRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Department not found", 404);
    }

    const department = await departmentsRepository.update({
      id: parseInt(id),
      code,
      name,
      description,
      head_name,
      head_email,
      head_phone,
      is_active,
    });

    res.json(department);
  }),

  /**
   * Delete department
   * DELETE /api/departments/:id
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await departmentsRepository.getById(parseInt(id));
    if (!existing) {
      throw new AppError("Department not found", 404);
    }

    await departmentsRepository.delete(parseInt(id));
    res.status(204).send();
  }),
};
