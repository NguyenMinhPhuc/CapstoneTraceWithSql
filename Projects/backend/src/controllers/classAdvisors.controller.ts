import { Request, Response } from "express";
import { classAdvisorsRepository } from "../repositories/classAdvisors.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const classAdvisorsController = {
  /**
   * Assign class advisor
   */
  assign: asyncHandler(async (req: Request, res: Response) => {
    const {
      class_id,
      teacher_id,
      teacher_type,
      semester,
      academic_year,
      notes,
    } = req.body;
    const assigned_by = (req as any).user?.id;

    if (!class_id || !teacher_id || !semester || !academic_year) {
      throw new AppError(
        "class_id, teacher_id, semester, and academic_year are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const advisor = await classAdvisorsRepository.assign({
      class_id,
      teacher_id,
      teacher_type,
      semester,
      academic_year,
      assigned_by,
      notes,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: advisor,
    });
  }),

  /**
   * Get all class advisors with filters
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const classId = req.query.class_id
      ? parseInt(req.query.class_id as string)
      : undefined;
    const teacherId = req.query.teacher_id as string | undefined;
    const semester = req.query.semester as string | undefined;
    const academicYear = req.query.academic_year as string | undefined;
    const isActive =
      req.query.is_active === "true"
        ? true
        : req.query.is_active === "false"
          ? false
          : undefined;

    const advisors = await classAdvisorsRepository.getAll(
      classId,
      teacherId,
      semester,
      academicYear,
      isActive
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: advisors,
    });
  }),

  /**
   * Get advisor assignment history for a class
   */
  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const classId = parseInt(req.params.classId);

    if (isNaN(classId)) {
      throw new AppError("Invalid class ID", StatusCodes.BAD_REQUEST);
    }

    const history = await classAdvisorsRepository.getHistory(classId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: history,
    });
  }),

  /**
   * Update class advisor
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { notes, is_active } = req.body;

    if (isNaN(id)) {
      throw new AppError("Invalid advisor ID", StatusCodes.BAD_REQUEST);
    }

    await classAdvisorsRepository.update({
      id,
      notes,
      is_active,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Class advisor updated successfully",
    });
  }),

  /**
   * Delete class advisor assignment
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid advisor ID", StatusCodes.BAD_REQUEST);
    }

    await classAdvisorsRepository.delete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Class advisor deleted successfully",
    });
  }),

  /**
   * Add advisor profile entry
   */
  addProfile: asyncHandler(async (req: Request, res: Response) => {
    const {
      advisor_id,
      profile_type,
      title,
      content,
      profile_data,
      attachments,
    } = req.body;
    const created_by = (req as any).user?.id;

    if (!advisor_id) {
      throw new AppError("advisor_id is required", StatusCodes.BAD_REQUEST);
    }

    const profile = await classAdvisorsRepository.addProfile({
      advisor_id,
      profile_type,
      title,
      content,
      profile_data,
      attachments,
      created_by,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: profile,
    });
  }),

  /**
   * Get advisor profiles
   */
  getProfiles: asyncHandler(async (req: Request, res: Response) => {
    const advisorId = req.query.advisor_id
      ? parseInt(req.query.advisor_id as string)
      : undefined;
    const classId = req.query.class_id
      ? parseInt(req.query.class_id as string)
      : undefined;
    const profileType = req.query.profile_type as string | undefined;

    const profiles = await classAdvisorsRepository.getProfiles(
      advisorId,
      classId,
      profileType
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: profiles,
    });
  }),
};
