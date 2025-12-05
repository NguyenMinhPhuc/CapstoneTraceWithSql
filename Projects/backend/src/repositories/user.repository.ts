import { getPool } from "../database/connection";
import { Request as MSSQLRequest } from "mssql";

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  password_algo?: string;
  password_version?: number;
  full_name: string;
  role: "admin" | "manager" | "supervisor" | "student" | "council_member";
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  // Extended fields from joins
  student_id?: string;
  student_code?: string;
  class_id?: number;
  class_name?: string;
  major_id?: number;
  major_name?: string;
  gpa?: number;
  supervisor_id?: string;
  department?: string;
  title?: string;
  max_students?: number;
  current_students?: number;
  specializations?: string;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  full_name: string;
  role: "admin" | "manager" | "supervisor" | "student" | "council_member";
  phone?: string;
  student_code?: string;
  class_id?: number;
  major_id?: number;
}

export interface RefreshToken {
  id: number;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

/**
 * User Repository - Data Access Layer for User operations
 */
export class UserRepository {
  /**
   * Register a new user with role-specific profile
   */
  static async register(data: CreateUserData): Promise<string> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("email", data.email)
      .input("password_hash", data.password_hash)
      .input("full_name", data.full_name)
      .input("role", data.role)
      .input("phone", data.phone || null)
      .input("student_code", data.student_code || null)
      .input("class_id", data.class_id || null)
      .input("major_id", data.major_id || null)
      .execute("sp_RegisterUser");

    return result.recordset[0].user_id as string;
  }

  /**
   * Get user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("email", email)
      .execute("sp_GetUserByEmail");

    return result.recordset.length > 0 ? (result.recordset[0] as User) : null;
  }

  /**
   * Get user by ID
   */
  static async findById(userId: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_GetUserById");

    return result.recordset.length > 0 ? (result.recordset[0] as User) : null;
  }

  /**
   * Get complete user profile with role-specific data
   */
  static async getProfile(userId: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_GetUserProfile");

    return result.recordset.length > 0 ? (result.recordset[0] as User) : null;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    const pool = getPool();
    await pool.request().input("user_id", userId).execute("sp_UpdateLastLogin");
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    newPasswordHash: string
  ): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("user_id", userId)
      .input("new_password_hash", newPasswordHash)
      .execute("sp_ChangePassword");
  }

  /**
   * Save refresh token
   */
  static async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    clientIp: string,
    userAgent: string
  ): Promise<void> {
    const bcrypt = require("bcryptjs");
    const tokenHash = await bcrypt.hash(token, 10);

    const pool = getPool();
    await pool
      .request()
      .input("user_id", userId)
      .input("token_hash", tokenHash)
      .input("expires_at", expiresAt)
      .input("created_ip", clientIp)
      .input("created_user_agent", userAgent)
      .execute("sp_SaveRefreshToken");
  }

  /**
   * Get refresh token with user info
   */
  static async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const bcrypt = require("bcryptjs");
    const pool = getPool();

    // Get all refresh tokens for comparison
    const result = await pool
      .request()
      .query(
        "SELECT * FROM refresh_tokens WHERE expires_at > SYSUTCDATETIME()"
      );

    // Compare token with stored hashes
    for (const row of result.recordset) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        // Get user info
        const userResult = await pool
          .request()
          .input("user_id", row.user_id)
          .query(
            "SELECT id, email, role, is_active FROM users WHERE id = @user_id"
          );

        if (userResult.recordset.length > 0) {
          return {
            ...row,
            user: userResult.recordset[0],
          } as RefreshToken;
        }
      }
    }

    return null;
  }

  /**
   * Delete specific refresh token
   */
  static async deleteRefreshToken(token: string): Promise<number> {
    const bcrypt = require("bcryptjs");
    const pool = getPool();

    // Get all refresh tokens for comparison
    const result = await pool
      .request()
      .query("SELECT id, token_hash FROM refresh_tokens");

    // Find matching token
    for (const row of result.recordset) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        await pool
          .request()
          .input("token_id", row.id)
          .query("DELETE FROM refresh_tokens WHERE id = @token_id");
        return 1;
      }
    }

    return 0;
  }

  /**
   * Delete all refresh tokens for a user
   */
  static async deleteUserRefreshTokens(userId: string): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_DeleteUserRefreshTokens");

    return result.recordset[0].rows_affected;
  }
}
