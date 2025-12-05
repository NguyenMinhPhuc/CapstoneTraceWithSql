import { Request, Response } from "express";
import { companiesRepository } from "../repositories/companies.repository";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { StatusCodes } from "http-status-codes";

export const companiesController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { is_active } = req.query as { is_active?: string };
    let active: boolean | undefined = undefined;
    if (is_active !== undefined) {
      if (is_active === "true" || is_active === "1") active = true;
      else if (is_active === "false" || is_active === "0") active = false;
    }
    const companies = await companiesRepository.getAll(active as any);
    res.status(StatusCodes.OK).json({ success: true, data: companies });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const company = await companiesRepository.getById(id);
    if (!company)
      throw new AppError("Company not found", StatusCodes.NOT_FOUND);
    res.status(StatusCodes.OK).json({ success: true, data: company });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      address,
      phone,
      email,
      contact_person,
      contact_phone,
      website,
      description,
      is_active,
    } = req.body;

    if (!name) throw new AppError("Name is required", StatusCodes.BAD_REQUEST);

    const company = await companiesRepository.create({
      name,
      address,
      phone,
      email,
      contact_person,
      contact_phone,
      website,
      description,
      is_active,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: company });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = { id, ...req.body } as any;
    const company = await companiesRepository.update(data);
    if (!company)
      throw new AppError("Company not found", StatusCodes.NOT_FOUND);
    res.status(StatusCodes.OK).json({ success: true, data: company });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await companiesRepository.delete(id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Company deleted" });
  }),
};

export default companiesController;
