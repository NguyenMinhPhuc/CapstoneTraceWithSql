import { getPool } from "../database/connection";

export interface UserListItem {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "supervisor" | "student" | "council_member" | "manager";
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  // Student data
  student_id?: string;
  student_code?: string;
  class_id?: number;
  major_id?: number;
  gpa?: number;
  class_name?: string;
  major_name?: string;
  // Supervisor data
  supervisor_id?: string;
  department?: string;
  title?: string;
  max_students?: number;
  current_students?: number;
  specializations?: string;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export class UserManagementRepository {
  /**
   * Get paginated list of users
   */
  static async listUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    role?: string,
    isActive?: boolean
  ): Promise<UserListResponse> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("page", page)
      .input("page_size", pageSize)
      .input("search", search || null)
      .input("role", role || null)
      .input("is_active", isActive !== undefined ? isActive : null)
      .execute("sp_ListUsers");

    const users = result.recordset;
    const total = users.length > 0 ? users[0].total_count : 0;

    return {
      users: users.map((u) => {
        const { total_count, ...user } = u;
        return user as UserListItem;
      }),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get user details by ID
   */
  static async getUserDetails(userId: string): Promise<UserListItem | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_GetUserDetails");

    return result.recordset.length > 0
      ? (result.recordset[0] as UserListItem)
      : null;
  }

  /**
   * Update user information
   */
  static async updateUser(
    userId: string,
    fullName: string,
    phone?: string,
    avatarUrl?: string,
    isActive?: boolean
  ): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .input("full_name", fullName)
      .input("phone", phone || null)
      .input("avatar_url", avatarUrl || null)
      .input("is_active", isActive !== undefined ? isActive : true)
      .execute("sp_UpdateUser");

    return result.recordset[0].rows_affected;
  }

  /**
   * Update student information
   */
  static async updateStudentInfo(
    studentId: string,
    classId?: number,
    majorId?: number,
    gpa?: number,
    status?: string
  ): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", studentId)
      .input("class_id", classId || null)
      .input("major_id", majorId || null)
      .input("gpa", gpa || null)
      .input("status", status || null)
      .execute("sp_UpdateStudentInfo");

    return result.recordset[0].rows_affected;
  }

  /**
   * Update supervisor information
   */
  static async updateSupervisorInfo(
    supervisorId: string,
    department?: string,
    title?: string,
    maxStudents?: number,
    specializations?: string | string[]
  ): Promise<number> {
    const pool = getPool();

    // Convert specializations array to comma-separated string if needed
    let specializationsStr: string | null = null;
    if (specializations !== undefined && specializations !== null) {
      if (Array.isArray(specializations)) {
        specializationsStr = specializations.join(", ");
      } else if (typeof specializations === "string") {
        specializationsStr = specializations;
      }
    }

    const result = await pool
      .request()
      .input("supervisor_id", supervisorId)
      .input("department", department || null)
      .input("title", title || null)
      .input("max_students", maxStudents || null)
      .input("specializations", specializationsStr || null)
      .execute("sp_UpdateSupervisorInfo");

    return result.recordset[0].rows_affected;
  }

  /**
   * Soft delete user
   */
  static async deleteUser(userId: string): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_DeleteUser");

    return result.recordset[0].rows_affected;
  }

  /**
   * Activate user (set is_active = 1)
   */
  static async activateUser(userId: string): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .execute("sp_ActivateUser");

    return result.recordset[0].rows_affected;
  }

  /**
   * Reset user password
   */
  static async resetPassword(
    userId: string,
    newPasswordHash: string
  ): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", userId)
      .input("new_password_hash", newPasswordHash)
      .execute("sp_ResetUserPassword");

    return result.recordset[0].rows_affected;
  }
}
