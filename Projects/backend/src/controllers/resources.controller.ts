import { Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import ResourcesRepository from "../repositories/resources.repository";

export const listResources = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;

    const { resources, total } = await ResourcesRepository.getResources(
      page,
      pageSize,
      category,
      search,
      isActive
    );

    res.status(200).json({
      success: true,
      data: {
        resources,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }
);

export const getResource = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const resource = await ResourcesRepository.getResourceById(id);

    if (!resource) {
      throw new AppError("Resource not found", 404);
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  }
);

export const createResource = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, summary, category, resource_type, is_active } = req.body;

    if (!name || !category) {
      throw new AppError("Name and category are required", 400);
    }

    const validCategories = ["graduation", "internship"];
    if (!validCategories.includes(category)) {
      throw new AppError(
        "Invalid category. Must be either graduation or internship",
        400
      );
    }

    const resourceId = await ResourcesRepository.createResource({
      name,
      summary,
      category,
      resource_type,
      created_by: req.user!.id,
      is_active: is_active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: { id: resourceId },
    });
  }
);

export const updateResource = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, summary, category, resource_type, is_active } = req.body;

    if (!name || !category) {
      throw new AppError("Name and category are required", 400);
    }

    const validCategories = ["graduation", "internship"];
    if (!validCategories.includes(category)) {
      throw new AppError(
        "Invalid category. Must be either graduation or internship",
        400
      );
    }

    const updated = await ResourcesRepository.updateResource(id, {
      name,
      summary,
      category,
      resource_type,
      is_active: is_active ?? true,
    });

    if (!updated) {
      throw new AppError("Resource not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
    });
  }
);

export const deleteResource = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);

    const deleted = await ResourcesRepository.deleteResource(id);

    if (!deleted) {
      throw new AppError("Resource not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  }
);

export const addResourceLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const resourceId = parseInt(req.params.id);
    const { label, url, order_index } = req.body;

    if (!label || !url) {
      throw new AppError("Label and URL are required", 400);
    }

    // Check if resource exists
    const resource = await ResourcesRepository.getResourceById(resourceId);
    if (!resource) {
      throw new AppError("Resource not found", 404);
    }

    const linkId = await ResourcesRepository.addResourceLink({
      resource_id: resourceId,
      label,
      url,
      order_index,
    });

    res.status(201).json({
      success: true,
      message: "Link added successfully",
      data: { id: linkId },
    });
  }
);

export const updateResourceLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const linkId = parseInt(req.params.linkId);
    const { label, url, order_index } = req.body;

    if (!label || !url) {
      throw new AppError("Label and URL are required", 400);
    }

    const updated = await ResourcesRepository.updateResourceLink(linkId, {
      label,
      url,
      order_index: order_index ?? 0,
    });

    if (!updated) {
      throw new AppError("Link not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Link updated successfully",
    });
  }
);

export const deleteResourceLink = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const linkId = parseInt(req.params.linkId);

    const deleted = await ResourcesRepository.deleteResourceLink(linkId);

    if (!deleted) {
      throw new AppError("Link not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Link deleted successfully",
    });
  }
);
