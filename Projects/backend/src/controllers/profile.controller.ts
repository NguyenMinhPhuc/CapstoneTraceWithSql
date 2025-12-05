import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { UserRepository } from "../repositories/user.repository";
import { UserManagementRepository } from "../repositories/user-management.repository";
import { AuthRequest } from "../middleware/auth";

export const getMyProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await UserRepository.getProfile(userId);

    // Convert relative avatar URL to full URL
    if (
      profile &&
      profile.avatar_url &&
      !profile.avatar_url.startsWith("http")
    ) {
      const protocol = req.protocol;
      const host = req.get("host");
      profile.avatar_url = `${protocol}://${host}${profile.avatar_url}`;
    }

    res.status(200).json({ success: true, data: profile });
  }
);

export const updateMyProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { fullName, phone, avatarUrl } = req.body;

    if (!fullName) {
      throw new AppError("Full name is required", 400);
    }

    await UserManagementRepository.updateUser(
      userId,
      fullName,
      phone,
      avatarUrl
    );

    res.status(200).json({ success: true, message: "Profile updated" });
  }
);

export const uploadMyAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as any;
    if (!file) throw new AppError("No file uploaded", 400);
    // Multer ensured type and size; file stored under /uploads/avatars
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const userId = req.user!.id;
    // Update only avatar; keep full name unchanged by fetching profile first
    const profile = await UserRepository.getProfile(userId);
    const fullName = profile?.full_name || "";
    await UserManagementRepository.updateUser(
      userId,
      fullName,
      profile?.phone,
      avatarUrl
    );
    // Return full URL to frontend
    const protocol = req.protocol;
    const host = req.get("host");
    const fullAvatarUrl = `${protocol}://${host}${avatarUrl}`;
    res.status(200).json({ success: true, data: { avatarUrl: fullAvatarUrl } });
  }
);
