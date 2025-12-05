import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";
import { UserRepository } from "../repositories/user.repository";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-please-change-in-env";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "fallback-refresh-secret-key-please-change-in-env";
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET or JWT_REFRESH_SECRET not set in environment variables!"
  );
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  studentCode?: string;
  classId?: number;
  majorId?: number;
}

interface LoginData {
  email: string;
  password: string;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    fullName,
    role,
    studentCode,
    classId,
    majorId,
  }: RegisterData = req.body;

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
    student_code: studentCode,
    class_id: classId,
    major_id: majorId,
  });

  // Generate token
  // @ts-ignore
  const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: userId,
        email,
        fullName,
        role,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginData = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  // Get user
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user is active
  if (!user.is_active) {
    throw new AppError("Your account has been disabled", 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate tokens
  // @ts-ignore
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );

  // @ts-ignore
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });

  // Save refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Get client IP and user agent from request
  const clientIp = (
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    ""
  )
    .split(",")[0]
    .trim();
  const userAgent = req.headers["user-agent"] || "";

  await UserRepository.saveRefreshToken(
    user.id,
    refreshToken,
    expiresAt,
    clientIp,
    userAgent
  );

  // Update last login
  await UserRepository.updateLastLogin(user.id);

  // Get full user profile
  const fullUser = await UserRepository.getProfile(user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: fullUser!.id,
        email: fullUser!.email,
        fullName: fullUser!.full_name,
        role: fullUser!.role,
        studentCode: fullUser!.student_code,
        supervisorCode: fullUser!.supervisor_id,
        phone: fullUser!.phone,
        address: fullUser!.phone, // Note: address not in profile, using phone as placeholder
        major: fullUser!.major_name,
        className: fullUser!.class_name,
        isActive: fullUser!.is_active,
        createdAt: fullUser!.created_at,
        updatedAt: fullUser!.updated_at,
        department: fullUser!.department,
        title: fullUser!.title,
        avatar: fullUser!.avatar_url,
      },
      token,
      refreshToken,
    },
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      id: string;
    };

    // Check if refresh token exists and is valid
    const tokenData = await UserRepository.getRefreshToken(refreshToken);

    if (!tokenData) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Get user
    const user = await UserRepository.findById(decoded.id);

    if (!user || !user.is_active) {
      throw new AppError("User not found", 404);
    }

    // Generate new access token
    // @ts-ignore
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: refreshToken, // Return the same refresh token
      },
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await UserRepository.deleteRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;

  const profile = await UserRepository.getProfile(userId);

  if (!profile) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        studentCode: profile.student_code,
        supervisorCode: profile.supervisor_id,
        phone: profile.phone,
        address: profile.phone,
        major: profile.major_name,
        className: profile.class_name,
        isActive: profile.is_active,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    },
  });
});

export const changePassword = asyncHandler(async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  // Get current user
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password (also invalidates all refresh tokens)
  await UserRepository.changePassword(userId, hashedPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
