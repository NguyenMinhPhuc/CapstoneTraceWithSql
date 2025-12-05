import sql from "mssql";
import { getPool } from "../database/connection";
import bcrypt from "bcryptjs";

export interface Student {
  id: number;
  student_code: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  class_id?: number;
  class_name?: string;
  class_code?: string;
  major_id?: number;
  major_name?: string;
  major_code?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  avatar_url?: string;
  status: string; // 'Đang học' | 'Bảo lưu' | 'Nghỉ học' | 'Nghỉ học khi tuyển sinh' | 'Đã tốt nghiệp'
  user_id?: string; // Link to users table
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentInput {
  student_code: string;
  full_name: string;
  email?: string; // Optional - will be auto-generated as MSSV@lachong.edu.vn if not provided
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  class_id?: number;
  avatar_url?: string;
  status?: string; // 'Đang học' | 'Bảo lưu' | 'Nghỉ học' | 'Nghỉ học khi tuyển sinh' | 'Đã tốt nghiệp'
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  id: number;
}

export const studentsRepository = {
  /**
   * Get all students with optional filters
   */
  async getAll(
    classId?: number,
    majorId?: number,
    departmentId?: number,
    status?: string
  ): Promise<Student[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("class_id", sql.Int, classId ?? null)
      .input("major_id", sql.Int, majorId ?? null)
      .input("department_id", sql.Int, departmentId ?? null)
      .input("status", sql.NVarChar(50), status ?? null)
      .execute("sp_GetAllStudents");
    return result.recordset;
  },

  /**
   * Get student by ID
   */
  async getById(id: number): Promise<Student | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetStudentById");
    return result.recordset[0] || null;
  },

  /**
   * Get student record by linked user_id (users.id)
   */
  async getByUserId(user_id: string): Promise<Student | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(50), user_id)
      .query("SELECT TOP (1) * FROM students WHERE user_id = @user_id");
    return result.recordset[0] || null;
  },

  /**
   * Create a new student (with user account)
   */
  async create(data: CreateStudentInput): Promise<Student> {
    const pool = getPool();

    // Generate email: MSSV@lachong.edu.vn
    const studentEmail = `${data.student_code}@lachong.edu.vn`;

    // Hash password "123456" for the user account
    const hashedPassword = await bcrypt.hash("123456", 12);

    // Create student record (which also creates user account in the stored procedure)
    let result;
    try {
      result = await pool
        .request()
        .input("student_code", sql.NVarChar(50), data.student_code)
        .input("full_name", sql.NVarChar(255), data.full_name)
        .input("email", sql.NVarChar(255), studentEmail)
        .input("phone", sql.NVarChar(20), data.phone ?? null)
        .input("date_of_birth", sql.Date, data.date_of_birth ?? null)
        .input("gender", sql.NVarChar(10), data.gender ?? null)
        .input("address", sql.NVarChar(sql.MAX), data.address ?? null)
        .input("class_id", sql.Int, data.class_id ?? null)
        .input("avatar_url", sql.NVarChar(sql.MAX), data.avatar_url ?? null)
        .input("status", sql.NVarChar(50), data.status ?? "Đang học")
        .input("password_hash", sql.NVarChar(500), hashedPassword)
        .execute("sp_CreateStudent");
    } catch (error: any) {
      // Extract detailed error message from SQL Server
      console.error("Database error creating student:", {
        message: error.message,
        number: error.number,
        state: error.state,
        class: error.class,
        serverName: error.serverName,
        procName: error.procName,
        lineNumber: error.lineNumber,
      });

      // Re-throw with detailed message
      throw new Error(error.message || "Database error creating student");
    }

    return result.recordset[0];
  },

  /**
   * Update an existing student
   */
  async update(data: UpdateStudentInput): Promise<Student> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("student_code", sql.NVarChar(50), data.student_code)
      .input("full_name", sql.NVarChar(255), data.full_name)
      .input("email", sql.NVarChar(255), data.email)
      .input("phone", sql.NVarChar(20), data.phone ?? null)
      .input("date_of_birth", sql.Date, data.date_of_birth ?? null)
      .input("gender", sql.NVarChar(10), data.gender ?? null)
      .input("address", sql.NVarChar(sql.MAX), data.address ?? null)
      .input("class_id", sql.Int, data.class_id ?? null)
      .input("avatar_url", sql.NVarChar(sql.MAX), data.avatar_url ?? null)
      .input("status", sql.NVarChar(50), data.status ?? "Đang học")
      .execute("sp_UpdateStudent");
    return result.recordset[0];
  },

  /**
   * Delete a student
   */
  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).execute("sp_DeleteStudent");
  },
};
