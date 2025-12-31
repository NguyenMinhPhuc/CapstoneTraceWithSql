import { Request, Response } from "express";
import { defenseRepository } from "../repositories/defense.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const defenseController = {
  getSessionTypes: asyncHandler(async (req: Request, res: Response) => {
    const types = await defenseRepository.getSessionTypes();
    res.status(StatusCodes.OK).json({ success: true, data: types });
  }),

  getRubrics: asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    const rubrics = await defenseRepository.getRubrics(type as string);
    res.status(StatusCodes.OK).json({ success: true, data: rubrics });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { session_type, status } = req.query as {
      session_type?: string;
      status?: string;
    };

    const sessions = await defenseRepository.getAll(
      session_type ?? null,
      status ?? null
    );

    res.status(StatusCodes.OK).json({ success: true, data: sessions });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new AppError("Invalid id", StatusCodes.BAD_REQUEST);
    }
    const session = await defenseRepository.getById(numericId);
    if (!session) {
      throw new AppError("Defense session not found", StatusCodes.NOT_FOUND);
    }
    res.status(StatusCodes.OK).json({ success: true, data: session });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body;
    console.log("Defense create payload:", payload);
    if (!payload || !payload.name || payload.session_type == null) {
      throw new AppError(
        "name and session_type are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const created = await defenseRepository.create(payload);
    res.status(StatusCodes.CREATED).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new AppError("Invalid id", StatusCodes.BAD_REQUEST);
    }

    const updated = await defenseRepository.update({
      id: numericId,
      ...req.body,
    });
    if (!updated) {
      throw new AppError("Defense session not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new AppError("Invalid id", StatusCodes.BAD_REQUEST);
    }
    await defenseRepository.delete(numericId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Defense session deleted" });
  }),

  // Registrations
  getRegistrationsBySession: asyncHandler(
    async (req: Request, res: Response) => {
      const { sessionId } = req.params as { sessionId?: string };
      const numericId = parseInt(sessionId || "", 10);
      if (isNaN(numericId)) {
        throw new AppError("Invalid session id", StatusCodes.BAD_REQUEST);
      }
      const regs = await defenseRepository.getRegistrationsBySession(numericId);
      res.status(StatusCodes.OK).json({ success: true, data: regs });
    }
  ),

  createRegistration: asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params as { sessionId?: string };
    const numericId = parseInt(sessionId || "", 10);
    if (isNaN(numericId)) {
      throw new AppError("Invalid session id", StatusCodes.BAD_REQUEST);
    }

    const payload = req.body;
    if (!payload || !payload.student_id) {
      throw new AppError("student_id is required", StatusCodes.BAD_REQUEST);
    }

    const created = await defenseRepository.createRegistration({
      session_id: numericId,
      student_id: payload.student_id,
      student_code: payload.student_code ?? null,
      student_name: payload.student_name ?? null,
      class_name: payload.class_name ?? null,
      graduation_status: payload.graduation_status ?? null,
      internship_status: payload.internship_status ?? null,
      report_status:
        payload.report_status ??
        payload.graduation_status ??
        payload.internship_status ??
        null,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: created });
  }),

  createRegistrationForCurrentUser: asyncHandler(
    async (req: Request, res: Response) => {
      const authReq = req as any;
      const { sessionId } = req.params as { sessionId?: string };
      const numericId = parseInt(sessionId || "", 10);
      if (isNaN(numericId)) {
        throw new AppError("Invalid session id", StatusCodes.BAD_REQUEST);
      }

      if (!authReq.user || !authReq.user.id) {
        throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
      }

      const pool = (await import("../database/connection")).getPool();

      // Find student record for this user
      const userId = authReq.user.id;
      const studentResult = await pool
        .request()
        .input("userId", userId)
        .query(
          "SELECT id, student_code, class_id FROM dbo.students WHERE user_id = @userId"
        );

      if (!studentResult.recordset || studentResult.recordset.length === 0) {
        throw new AppError(
          "Student profile not found for user",
          StatusCodes.BAD_REQUEST
        );
      }

      const student = studentResult.recordset[0];
      let className: string | null = null;
      if (student.class_id) {
        const classRes = await pool
          .request()
          .input("classId", student.class_id)
          .query("SELECT code FROM dbo.classes WHERE id = @classId");
        if (classRes.recordset && classRes.recordset.length > 0) {
          className = classRes.recordset[0].code;
        }
      }

      // Accept optional payload (project title etc.) but derive student id from DB
      const payload = req.body || {};

      const created = await defenseRepository.createRegistration({
        session_id: numericId,
        student_id: Number(student.id),
        student_code: student.student_code ?? null,
        student_name: payload.student_name ?? null,
        class_name: className ?? payload.class_name ?? null,
        graduation_status: payload.graduation_status ?? null,
        internship_status: payload.internship_status ?? null,
        report_status:
          payload.report_status ??
          payload.graduation_status ??
          payload.internship_status ??
          null,
      });

      res.status(StatusCodes.CREATED).json({ success: true, data: created });
    }
  ),

  getRegistrationForCurrentUser: asyncHandler(
    async (req: Request, res: Response) => {
      const authReq = req as any;
      if (!authReq.user || !authReq.user.id) {
        throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
      }

      const pool = (await import("../database/connection")).getPool();
      const userId = authReq.user.id;

      // Find student record
      const studentResult = await pool
        .request()
        .input("userId", userId)
        .query("SELECT id FROM dbo.students WHERE user_id = @userId");

      if (!studentResult.recordset || studentResult.recordset.length === 0) {
        return res.status(StatusCodes.OK).json({ success: true, data: null });
      }

      const studentId = Number(studentResult.recordset[0].id);

      // Find registration tied to an ongoing session
      const result = await pool
        .request()
        .input("studentId", studentId)
        .query(
          `SELECT dr.*, ds.name AS session_name, ds.status AS session_status
         FROM dbo.defense_registrations dr
         INNER JOIN dbo.defense_sessions ds ON ds.id = dr.session_id
         WHERE dr.student_id = @studentId AND ds.status = 'ongoing'`
        );

      if (!result.recordset || result.recordset.length === 0) {
        return res.status(StatusCodes.OK).json({ success: true, data: null });
      }

      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: result.recordset[0] });
    }
  ),

  updateRegistration: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const payload = req.body;

    const updated = await defenseRepository.updateRegistration(id, {
      graduation_status: payload.graduation_status ?? null,
      graduation_status_note: payload.graduation_status_note ?? null,
      internship_status: payload.internship_status ?? null,
      internship_status_note: payload.internship_status_note ?? null,
      report_status:
        payload.report_status ??
        payload.graduation_status ??
        payload.internship_status ??
        null,
      report_status_note:
        payload.report_status_note ??
        payload.graduation_status_note ??
        payload.internship_status_note ??
        null,
    });

    res.json({ data: updated });
  }),

  deleteRegistration: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new AppError("Invalid id", StatusCodes.BAD_REQUEST);
    }
    const result = await defenseRepository.deleteRegistration(numericId);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  }),
};
