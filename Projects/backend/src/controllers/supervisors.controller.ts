import { Request, Response } from "express";
import { supervisorsRepository } from "../repositories/supervisors.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const supervisorsController = {
  /**
   * Get all supervisors
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { department, lecturer_type, title } = req.query as {
      department?: string;
      lecturer_type?: string;
      title?: string;
    };

    const filters: {
      department?: number;
      lecturer_type?: string;
      title?: string;
    } = {};
    if (department) {
      const d = parseInt(department, 10);
      if (!isNaN(d)) filters.department = d;
    }
    if (lecturer_type) filters.lecturer_type = lecturer_type;
    if (title) filters.title = title;

    const supervisors = await supervisorsRepository.getAll(filters);
    res.status(StatusCodes.OK).json({ success: true, data: supervisors });
  }),

  /**
   * Get a supervisor by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const supervisor = await supervisorsRepository.getById(id);

    if (!supervisor) {
      throw new AppError("Lecturer not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({ success: true, data: supervisor });
  }),

  /**
   * Create a supervisor
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const {
      email,
      full_name,
      phone,
      department,
      lecturer_type,
      title,
      max_students,
      specializations,
      avatar_url,
    } = req.body;

    if (!email || !full_name || !department || !title) {
      throw new AppError(
        "Email, full_name, department, and title are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const supervisor = await supervisorsRepository.create({
      email,
      full_name,
      phone,
      department,
      lecturer_type,
      title,
      max_students,
      specializations,
      avatar_url,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: supervisor });
  }),

  /**
   * Update a supervisor
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const supervisor = await supervisorsRepository.update({ id, ...req.body });

    if (!supervisor) {
      throw new AppError("Lecturer not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({ success: true, data: supervisor });
  }),

  /**
   * Delete a supervisor
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await supervisorsRepository.delete(id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Lecturer deleted successfully" });
  }),
};
