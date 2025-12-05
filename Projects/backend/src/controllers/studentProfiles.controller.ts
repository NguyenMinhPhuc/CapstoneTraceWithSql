import { Request, Response } from "express";
import { studentProfilesRepository } from "../repositories/studentProfiles.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middleware/auth";
import { studentsRepository } from "../repositories/students.repository";

// Helper to compare ids that might be numeric or string (GUID)
const idsMatch = (reqId: any, studId: any) => {
  const reqNum = Number(reqId);
  const studNum = Number(studId);
  if (!Number.isNaN(reqNum) && !Number.isNaN(studNum)) return reqNum === studNum;
  return String(reqId) === String(studId);
};

export const studentProfilesController = {
  getByStudentId: asyncHandler(async (req: AuthRequest, res: Response) => {
    const rawParam = req.params.studentId;

    // Resolve student_id: accept either numeric students.id or a users.id (GUID)
    let student_id: number | null = null;
    const parsed = Number(rawParam);
    let resolvedStudentRecord = null;
    if (!Number.isNaN(parsed)) {
      student_id = parsed;
    } else {
      // Try to find student by linked user_id
      resolvedStudentRecord = await studentsRepository.getByUserId(rawParam);
      if (resolvedStudentRecord) student_id = resolvedStudentRecord.id;
    }

    // Allow admin/manager to view any profile; students can view their own profile
    const requester = req.user;
    if (!requester) {
      throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
    }

    const isPrivileged =
      requester.role === "admin" || requester.role === "manager";

    // If we couldn't resolve student_id, deny for non-privileged users
    if (student_id === null) {
      if (!isPrivileged) {
        throw new AppError(
          "You do not have permission to view this profile",
          StatusCodes.FORBIDDEN
        );
      }
      // privileged but unresolved -> return null
      return res.status(StatusCodes.OK).json({ success: true, data: null });
    }

    // If requester is student, ensure they only access their own profile
    if (!isPrivileged && requester.role === "student") {
      // If we resolved via user_id earlier, check it's the same user
      if (resolvedStudentRecord) {
        if (resolvedStudentRecord.user_id !== requester.id) {
          throw new AppError(
            "You do not have permission to view this profile",
            StatusCodes.FORBIDDEN
          );
        }
      } else {
        // resolved by numeric student id: try to find the student's record to compare
        const owner = await studentsRepository.getById(student_id);
        if (!owner || owner.user_id !== requester.id) {
          throw new AppError(
            "You do not have permission to view this profile",
            StatusCodes.FORBIDDEN
          );
        }
      }
    }

    const profile = await studentProfilesRepository.getByStudentId(student_id);
    if (!profile)
      return res.status(StatusCodes.OK).json({ success: true, data: null });
    res.status(StatusCodes.OK).json({ success: true, data: profile });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const input = req.body;

    const requester = req.user;
    if (!requester) {
      throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
    }
    const isPrivileged =
      requester.role === "admin" || requester.role === "manager";

    // If requester is a student, override the input.student_id to prevent spoofing.
    if (requester.role === "student") {
      // Try numeric parse first (in case migration already uses INT ids)
      const parsed = Number(requester.id);
      if (!Number.isNaN(parsed)) {
        input.student_id = parsed;
      } else {
        // Fall back to lookup by user_id
        const student = await studentsRepository.getByUserId(requester.id);
        if (!student) {
          // Log for debugging why resolution failed
          console.error("studentProfiles.create: could not resolve student for user_id", requester.id);
          throw new AppError(
            "Unable to resolve student record for authenticated user",
            StatusCodes.BAD_REQUEST
          );
        }
        input.student_id = student.id;
      }
    }

    // For non-student requesters, require student_id in input
    if (!input.student_id) {
      throw new AppError("student_id is required", StatusCodes.BAD_REQUEST);
    }
    // Allow create if admin/manager or the requester is the student owning the profile
    if (!isPrivileged && requester.role !== "student" && !idsMatch(requester.id, input.student_id)) {
      throw new AppError(
        "You do not have permission to create this profile",
        StatusCodes.FORBIDDEN
      );
    }

    console.debug("studentProfiles.create called by", requester.id, requester.role, "input:", input);
    // If a profile already exists for this student_id, perform an update instead of attempting
    // to insert (the table uses student_id as the primary key). This prevents duplicate PK errors.
    const existing = await studentProfilesRepository.getByStudentId(input.student_id);
    if (existing) {
      const updated = await studentProfilesRepository.update({ student_id: input.student_id, ...input });
      return res.status(StatusCodes.OK).json({ success: true, data: updated });
    }

    const profile = await studentProfilesRepository.create(input);
    res.status(StatusCodes.CREATED).json({ success: true, data: profile });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const student_id = parseInt(req.params.id);
    const input = { student_id, ...req.body } as any;
    const requester = req.user;
    if (!requester) {
      throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
    }
    // If requester is a student, override the input.student_id to prevent spoofing.
    if (requester.role === "student") {
      const parsed = Number(requester.id);
      if (!Number.isNaN(parsed)) {
        input.student_id = parsed;
      } else {
        const student = await studentsRepository.getByUserId(requester.id);
        if (!student) {
          throw new AppError(
            "Unable to resolve student record for authenticated user",
            StatusCodes.BAD_REQUEST
          );
        }
        input.student_id = student.id;
      }
    }

    // Only admin/manager or student (if owner) can update
    const profile = await studentProfilesRepository.getByStudentId(input.student_id);
    const isPrivileged =
      requester.role === "admin" || requester.role === "manager";
    // Determine ownership:
    // - if requester is student, we've already resolved input.student_id from their account;
    //   check that the profile belongs to that student (numeric compare)
    // - otherwise, compare requester.id (user id) against profile.student_id when appropriate
    let isOwner = false;
    if (requester.role === "student") {
      isOwner = !!profile && profile.student_id === input.student_id;
    } else {
      isOwner = !!profile && idsMatch(requester.id, profile.student_id);
    }
    if (!isPrivileged && !isOwner) {
      throw new AppError(
        "You do not have permission to update this profile",
        StatusCodes.FORBIDDEN
      );
    }
    console.debug("studentProfiles.update called by", requester.id, requester.role, "input:", input);
    const updated = await studentProfilesRepository.update(input);
    res.status(StatusCodes.OK).json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const student_id = parseInt(req.params.id);
    await studentProfilesRepository.delete(student_id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Student profile deleted" });
  }),
};

export default studentProfilesController;
