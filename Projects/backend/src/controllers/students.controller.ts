import { Request, Response } from "express";
import { studentsRepository } from "../repositories/students.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const studentsController = {
  /**
   * Get all students
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const classId = req.query.class_id
      ? parseInt(req.query.class_id as string)
      : undefined;
    const majorId = req.query.major_id
      ? parseInt(req.query.major_id as string)
      : undefined;
    const departmentId = req.query.department_id
      ? parseInt(req.query.department_id as string)
      : undefined;
    const status = req.query.status as string | undefined;

    const students = await studentsRepository.getAll(
      classId,
      majorId,
      departmentId,
      status
    );
    res.status(StatusCodes.OK).json({ success: true, data: students });
  }),

  /**
   * Get student by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const student = await studentsRepository.getById(id);

    if (!student) {
      throw new AppError("Student not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({ success: true, data: student });
  }),

  /**
   * Create a new student
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const { student_code, full_name } = req.body;

    if (!student_code || !full_name) {
      throw new AppError(
        "Student code and full name are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const student = await studentsRepository.create(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: student });
  }),

  /**
   * Update a student
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const student = await studentsRepository.update({ id, ...req.body });
    res.status(StatusCodes.OK).json({ success: true, data: student });
  }),

  /**
   * Delete a student
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await studentsRepository.delete(id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Student deleted successfully" });
  }),
};
