import sql from "mssql";
import { getPool } from "../database/connection";

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  head_phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  head_phone?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentInput extends CreateDepartmentInput {
  id: number;
}

export const departmentsRepository = {
  /**
   * Get all departments
   */
  async getAll(isActive?: boolean): Promise<Department[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("is_active", sql.Bit, isActive ?? null)
      .execute("sp_GetAllDepartments");
    return result.recordset;
  },

  /**
   * Get department by ID
   */
  async getById(id: number): Promise<Department | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetDepartmentById");
    return result.recordset[0] || null;
  },

  /**
   * Create new department
   */
  async create(data: CreateDepartmentInput): Promise<Department> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("code", sql.NVarChar(20), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("description", sql.NVarChar(sql.MAX), data.description || null)
      .input("head_name", sql.NVarChar(255), data.head_name || null)
      .input("head_email", sql.NVarChar(255), data.head_email || null)
      .input("head_phone", sql.NVarChar(20), data.head_phone || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_CreateDepartment");
    return result.recordset[0];
  },

  /**
   * Update department
   */
  async update(data: UpdateDepartmentInput): Promise<Department> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("code", sql.NVarChar(20), data.code)
      .input("name", sql.NVarChar(255), data.name)
      .input("description", sql.NVarChar(sql.MAX), data.description || null)
      .input("head_name", sql.NVarChar(255), data.head_name || null)
      .input("head_email", sql.NVarChar(255), data.head_email || null)
      .input("head_phone", sql.NVarChar(20), data.head_phone || null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_UpdateDepartment");
    return result.recordset[0];
  },

  /**
   * Delete department
   */
  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteDepartment");
  },
};
