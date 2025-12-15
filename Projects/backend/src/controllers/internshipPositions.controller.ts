import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import internshipPositionsRepository from "../repositories/internshipPositions.repository";
import companiesRepository from "../repositories/companies.repository";
import { AppError } from "../middleware/errorHandler";

export const internshipPositionsController = {
  getByPeriod: asyncHandler(async (req: Request, res: Response) => {
    const sessionId = parseInt(
      req.params.sessionId || req.params.periodId || "",
      10
    );
    if (isNaN(sessionId))
      throw new AppError("Invalid session id", StatusCodes.BAD_REQUEST);
    const positions =
      await internshipPositionsRepository.getBySession(sessionId);
    res.status(StatusCodes.OK).json({ success: true, data: positions });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id))
      throw new AppError("Invalid position id", StatusCodes.BAD_REQUEST);
    const position = await internshipPositionsRepository.getById(id);
    if (!position)
      throw new AppError("Position not found", StatusCodes.NOT_FOUND);
    res.status(StatusCodes.OK).json({ success: true, data: position });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const sessionId = parseInt(
      req.params.sessionId || req.params.periodId || "",
      10
    );
    if (isNaN(sessionId))
      throw new AppError("Invalid session id", StatusCodes.BAD_REQUEST);

    const { company_id, title, description, capacity, manager_user_id } =
      req.body;
    if (!company_id || !title)
      throw new AppError(
        "company_id and title are required",
        StatusCodes.BAD_REQUEST
      );

    // Authorization: admin/staff can create; teacher may create if company is LHU
    const user = (req as any).user;
    const userRole = String(user?.role || "").toLowerCase();

    const company = await companiesRepository.getById(Number(company_id));
    if (!company)
      throw new AppError("Company not found", StatusCodes.NOT_FOUND);

    const isLhuCompany = String(company.company_type || "")
      .toLowerCase()
      .includes("lhu");

    if (userRole !== "admin" && userRole !== "staff") {
      if (!(userRole === "teacher" && isLhuCompany)) {
        throw new AppError(
          "You do not have permission to create positions for this company",
          StatusCodes.FORBIDDEN
        );
      }
    }

    const created = await internshipPositionsRepository.create({
      defense_session_id: sessionId,
      company_id: Number(company_id),
      title,
      description,
      capacity: Number(capacity ?? 1),
      manager_user_id: manager_user_id ?? null,
      created_by: user?.id ?? null,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id))
      throw new AppError("Invalid position id", StatusCodes.BAD_REQUEST);

    const existing = await internshipPositionsRepository.getById(id);
    if (!existing)
      throw new AppError("Position not found", StatusCodes.NOT_FOUND);

    // Authorization: similar rules as create
    const user = (req as any).user;
    const userRole = String(user?.role || "").toLowerCase();

    const company = await companiesRepository.getById(existing.company_id);
    const isLhuCompany = String(company?.company_type || "")
      .toLowerCase()
      .includes("lhu");

    if (userRole !== "admin" && userRole !== "staff") {
      if (!(userRole === "teacher" && isLhuCompany)) {
        throw new AppError(
          "You do not have permission to update this position",
          StatusCodes.FORBIDDEN
        );
      }
    }

    const updated = await internshipPositionsRepository.update(id, req.body);
    res.status(StatusCodes.OK).json({ success: true, data: updated });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id))
      throw new AppError("Invalid position id", StatusCodes.BAD_REQUEST);

    const existing = await internshipPositionsRepository.getById(id);
    if (!existing)
      throw new AppError("Position not found", StatusCodes.NOT_FOUND);

    const user = (req as any).user;
    const userRole = String(user?.role || "").toLowerCase();
    const company = await companiesRepository.getById(existing.company_id);
    const isLhuCompany = String(company?.company_type || "")
      .toLowerCase()
      .includes("lhu");

    if (userRole !== "admin" && userRole !== "staff") {
      if (!(userRole === "teacher" && isLhuCompany)) {
        throw new AppError(
          "You do not have permission to delete this position",
          StatusCodes.FORBIDDEN
        );
      }
    }

    await internshipPositionsRepository.delete(id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Position deleted" });
  }),
};

export default internshipPositionsController;
