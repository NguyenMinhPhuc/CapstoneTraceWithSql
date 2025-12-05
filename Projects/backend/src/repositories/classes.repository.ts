import sql from "mssql";
import { getPool } from "../database/connection";

export interface Class {
  id: number;
  code: string;
  name: string;
  major_id?: number;
  major_name?: string;
  major_code?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  academic_year?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  student_count?: number;
}

export interface CreateClassInput {
  code: string;
  name: string;
  major_id?: number;
  academic_year?: string;
  is_active?: boolean;
}

export interface UpdateClassInput extends CreateClassInput {
  id: number;
}

export const classesRepository = {
  /**
   * Get all classes
   */
  async getAll(
    majorId?: number,
    academicYear?: string,
    isActive?: boolean
  ): Promise<Class[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("major_id", sql.Int, majorId ?? null)
      .input("academic_year", sql.NVarChar(20), academicYear ?? null)
      .input("is_active", sql.Bit, isActive ?? null)
      .execute("sp_GetAllClasses");
    return result.recordset;
  },

  /**
   * Get class by ID
   */
  async getById(id: number): Promise<Class | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetClassById");
    return result.recordset[0] || null;
  },

  /**
   * Create new class
   */
  async create(data: CreateClassInput): Promise<Class> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("code", sql.NVarChar(50), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("major_id", sql.Int, data.major_id || null)
      .input("academic_year", sql.NVarChar(20), data.academic_year || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_CreateClass");
    return result.recordset[0];
  },

  /**
   * Update class
   */
  async update(data: UpdateClassInput): Promise<Class> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("code", sql.NVarChar(50), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("major_id", sql.Int, data.major_id || null)
      .input("academic_year", sql.NVarChar(20), data.academic_year || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_UpdateClass");
    return result.recordset[0];
  },

  /**
   * Delete class
   */
  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).execute("sp_DeleteClass");
  },
};
