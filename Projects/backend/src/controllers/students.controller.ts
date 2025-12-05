import { Request, Response } from "express";
import { studentsRepository } from "../repositories/students.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const studentsController = {
  /**
   * Get all students
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    // If 'page' param is present, use server-side paged API; otherwise use legacy sp_GetAllStudents
    if (req.query.page !== undefined) {
      // Support server-side paging, filtering and sorting
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize
        ? parseInt(req.query.pageSize as string)
        : 20;
      const q = (req.query.q as string) || null;
      const className = (req.query.class as string) || null;
      const profile = ((req.query.profile as string) || "all") as
        | "all"
        | "has"
        | "no";
      const sortBy = (req.query.sortBy as string) || "student_code";
      const sortDir = (req.query.sortDir as string) === "desc" ? "desc" : "asc";

      const result = await studentsRepository.getPaged({
        page,
        pageSize,
        q,
        className,
        profile,
        sortBy,
        sortDir,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.total,
          page,
          pageSize,
        },
      });
      return;
    }

    // No paging -> use stored procedure sp_GetAllStudents (legacy behavior)
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
    const userId = (req as any).user?.id; // Get user ID from auth middleware

    const student = await studentsRepository.update({
      id,
      ...req.body,
      changed_by: userId,
      change_notes: req.body.change_notes,
    });
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

  // Export students (CSV)
  export: asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || null;
    const className = (req.query.class as string) || null;
    const profile = ((req.query.profile as string) || "all") as
      | "all"
      | "has"
      | "no";
    const sortBy = (req.query.sortBy as string) || "student_code";
    const sortDir = (req.query.sortDir as string) === "desc" ? "desc" : "asc";

    const rows = await studentsRepository.getForExport({
      q,
      className,
      profile,
      sortBy,
      sortDir,
    });

    // Build CSV
    const header = [
      "id",
      "student_code",
      "full_name",
      "class_name",
      "has_profile",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.id ?? "",
          `"${String(r.student_code ?? "").replace(/"/g, '""')}"`,
          `"${String(r.full_name ?? "").replace(/"/g, '""')}"`,
          `"${String(r.class_name ?? "").replace(/"/g, '""')}"`,
          (r as any).has_profile ? "1" : "0",
        ].join(",")
      );
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="students_profiles.csv"`
    );
    res.send(csv);
  }),

  // Stats for dashboard/cards
  stats: asyncHandler(async (req: Request, res: Response) => {
    const className = (req.query.class as string) || null;
    const stats = await studentsRepository.getStats({ className });
    res.status(StatusCodes.OK).json({ success: true, data: stats });
  }),

  /**
   * Get status history for a student
   */
  getStatusHistory: asyncHandler(async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      throw new AppError("Invalid student ID", StatusCodes.BAD_REQUEST);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await studentsRepository.getStatusHistory(
      studentId,
      limit,
      offset
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        history: result.history,
        total: result.total,
        limit,
        offset,
      },
    });
  }),

  /**
   * Add status history record manually (for admin corrections)
   */
  addStatusHistory: asyncHandler(async (req: Request, res: Response) => {
    const { student_id, old_status, new_status, notes, change_type } = req.body;
    const changed_by = (req as any).user?.id; // From auth middleware

    if (!student_id || !new_status) {
      throw new AppError(
        "student_id and new_status are required",
        StatusCodes.BAD_REQUEST
      );
    }

    if (!changed_by) {
      throw new AppError("User not authenticated", StatusCodes.UNAUTHORIZED);
    }

    const result = await studentsRepository.addStatusHistory({
      student_id,
      old_status,
      new_status,
      changed_by,
      notes,
      change_type: change_type || "manual_entry",
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: result,
    });
  }),

  /**
   * Get all status history (admin reporting)
   */
  getAllStatusHistory: asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.start_date
      ? new Date(req.query.start_date as string)
      : undefined;
    const endDate = req.query.end_date
      ? new Date(req.query.end_date as string)
      : undefined;
    const changeType = (req.query.change_type as string) || undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await studentsRepository.getAllStatusHistory(
      startDate,
      endDate,
      changeType,
      limit,
      offset
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        history: result.history,
        total: result.total,
        limit,
        offset,
      },
    });
  }),
};
