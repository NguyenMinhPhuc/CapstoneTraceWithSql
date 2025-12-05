import sql from "mssql";
import { getPool } from "../database/connection";

export interface Major {
  id: number;
  code: string;
  name: string;
  description?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMajorInput {
  code: string;
  name: string;
  description?: string;
  department_id?: number;
  is_active?: boolean;
}

export interface UpdateMajorInput extends CreateMajorInput {
  id: number;
}

export const majorsRepository = {
  /**
   * Get all majors
   */
  async getAll(departmentId?: number, isActive?: boolean): Promise<Major[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("department_id", sql.Int, departmentId ?? null)
      .input("is_active", sql.Bit, isActive ?? null)
      .execute("sp_GetAllMajors");
    return result.recordset;
  },

  /**
   * Get major by ID
   */
  async getById(id: number): Promise<Major | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetMajorById");
    return result.recordset[0] || null;
  },

  /**
   * Create new major
   */
  async create(data: CreateMajorInput): Promise<Major> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("code", sql.NVarChar(20), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("description", sql.NVarChar(sql.MAX), data.description || null)
      .input("department_id", sql.Int, data.department_id || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_CreateMajor");
    return result.recordset[0];
  },

  /**
   * Update major
   */
  async update(data: UpdateMajorInput): Promise<Major> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("code", sql.NVarChar(20), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("description", sql.NVarChar(sql.MAX), data.description || null)
      .input("department_id", sql.Int, data.department_id || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_UpdateMajor");
    return result.recordset[0];
  },

  /**
   * Delete major
   */
  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).execute("sp_DeleteMajor");
  },
};
