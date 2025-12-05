import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { UserManagementRepository } from "../repositories/user-management.repository";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import path from "path";

/**
 * Upload user avatar (jpg/png)
 */
export const uploadUserAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    // Multer adds file to req.file
    const file = (req as any).file as any;
    if (!file) {
      throw new AppError("No file uploaded", 400);
    }
    // Validate mimetype
    if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
      throw new AppError("Only JPG or PNG files are allowed", 400);
    }

    // Build relative URL for storage
    const filename = path.basename(file.filename || file.originalname);
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user avatar_url
    const poolUpdate = await UserManagementRepository.updateUser(userId, {
      fullName: undefined as any, // repository supports optional fields; controller ensures minimal change
      avatarUrl,
    } as any);

    // Return full URL to frontend
    const protocol = req.protocol;
    const host = req.get("host");
    const fullAvatarUrl = `${protocol}://${host}${avatarUrl}`;

    res.status(200).json({
      success: true,
      message: "Avatar uploaded",
      data: { avatarUrl: fullAvatarUrl },
    });
  }
);

/**
 * Create new user (admin only)
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, role, phone } = req.body;

  // Validate input
  if (!email || !password || !fullName || !role) {
    throw new AppError("Please provide all required fields", 400);
  }

  // Check if user already exists
  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user via repository
  const userId = await UserRepository.register({
    email,
    password_hash: hashedPassword,
    full_name: fullName,
    role: role as
      | "admin"
      | "manager"
      | "supervisor"
      | "student"
      | "council_member",
    phone: phone || null,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { userId },
  });
});

/**
 * Get paginated list of users
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const isActive = req.query.isActive
    ? req.query.isActive === "true"
    : undefined;

  const result = await UserManagementRepository.listUsers(
    page,
    pageSize,
    search,
    role,
    isActive
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get user details by ID
 */
export const getUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await UserManagementRepository.getUserDetails(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/**
 * Update user information
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { fullName, phone, avatarUrl, isActive } = req.body;

  if (!fullName) {
    throw new AppError("Full name is required", 400);
  }

  const rowsAffected = await UserManagementRepository.updateUser(
    userId,
    fullName,
    phone,
    avatarUrl,
    isActive
  );

  if (rowsAffected === 0) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
  });
});

/**
 * Update student information
 */
export const updateStudentInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { classId, majorId, gpa, status } = req.body;

    const rowsAffected = await UserManagementRepository.updateStudentInfo(
      studentId,
      classId,
      majorId,
      gpa,
      status
    );

    if (rowsAffected === 0) {
      throw new AppError("Student not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Student information updated successfully",
    });
  }
);

/**
 * Update supervisor information
 */
export const updateSupervisorInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { supervisorId } = req.params;
    const { department, title, maxStudents, specializations } = req.body;

    const rowsAffected = await UserManagementRepository.updateSupervisorInfo(
      supervisorId,
      department,
      title,
      maxStudents,
      specializations
    );

    if (rowsAffected === 0) {
      throw new AppError("Supervisor not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Supervisor information updated successfully",
    });
  }
);

/**
 * Delete user (soft delete)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const rowsAffected = await UserManagementRepository.deleteUser(userId);

  if (rowsAffected === 0) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/**
 * Activate user
 */
export const activateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const rowsAffected = await UserManagementRepository.activateUser(userId);

    if (rowsAffected === 0) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "User activated successfully",
    });
  }
);

/**
 * Reset user password
 */
export const resetUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new AppError("New password is required", 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const rowsAffected = await UserManagementRepository.resetPassword(
      userId,
      hashedPassword
    );

    if (rowsAffected === 0) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
);
