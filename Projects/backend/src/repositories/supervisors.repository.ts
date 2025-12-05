import sql from "mssql";
import { getPool } from "../database/connection";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export interface Supervisor {
  id: string;
  user_id: string;
  department: number;
  title: string;
  max_students: number;
  current_students: number;
  specializations?: string;
  lecturer_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSupervisorInput {
  email: string;
  full_name: string;
  phone?: string;
  department: number;
  title: string;
  max_students?: number;
  specializations?: string | string[];
  lecturer_type?: string;
  avatar_url?: string;
}

export interface UpdateSupervisorInput extends Partial<CreateSupervisorInput> {
  id: string;
}

export const supervisorsRepository = {
  /**
   * Get all supervisors with user details
   */
  async getAll(filters?: {
    department?: number;
    lecturer_type?: string;
    title?: string;
  }): Promise<any[]> {
    const pool = getPool();
    const request = pool.request();

    // Bind optional filters
    if (filters) {
      if (filters.department !== undefined && filters.department !== null) {
        request.input("department", sql.Int, filters.department);
      } else {
        request.input("department", sql.Int, null);
      }

      if (
        filters.lecturer_type !== undefined &&
        filters.lecturer_type !== null
      ) {
        request.input(
          "lecturer_type",
          sql.NVarChar(100),
          filters.lecturer_type
        );
      } else {
        request.input("lecturer_type", sql.NVarChar(100), null);
      }

      if (filters.title !== undefined && filters.title !== null) {
        request.input("title", sql.NVarChar(100), filters.title);
      } else {
        request.input("title", sql.NVarChar(100), null);
      }
    } else {
      // No filters provided: pass nulls
      request
        .input("department", sql.Int, null)
        .input("lecturer_type", sql.NVarChar(100), null)
        .input("title", sql.NVarChar(100), null);
    }

    const result = await request.execute("sp_GetAllSupervisors");
    return result.recordset || [];
  },

  /**
   * Get supervisor by ID with user details
   */
  async getById(id: string): Promise<any> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.NVarChar(50), id)
      .execute("sp_GetSupervisorById");
    return result.recordset[0];
  },

  /**
   * Create a new supervisor
   */
  async create(data: CreateSupervisorInput): Promise<any> {
    const pool = getPool();

    try {
      // Hash password "123456"
      const password_hash = await bcrypt.hash("123456", 12);
      const user_id = uuidv4();
      const supervisor_id = uuidv4();

      // Convert specializations to plain string if it's an array
      // We store whatever the user entered as a string. If frontend sends an array,
      // join into a comma-separated string for readability (NOT JSON).
      let specializationsStr = null;
      if (data.specializations) {
        if (Array.isArray(data.specializations)) {
          specializationsStr = data.specializations.join(", ");
        } else if (typeof data.specializations === "string") {
          specializationsStr = data.specializations;
        }
      }

      const result = await pool
        .request()
        .input("supervisor_id", sql.NVarChar(50), supervisor_id)
        .input("user_id", sql.NVarChar(50), user_id)
        .input("email", sql.NVarChar(255), data.email)
        .input("password_hash", sql.NVarChar(500), password_hash)
        .input("full_name", sql.NVarChar(255), data.full_name)
        .input("phone", sql.NVarChar(20), data.phone ?? null)
        .input("avatar_url", sql.NVarChar(sql.MAX), data.avatar_url ?? null)
        .input("department", sql.Int, data.department)
        .input("lecturer_type", sql.NVarChar(100), data.lecturer_type ?? null)
        .input("title", sql.NVarChar(100), data.title)
        .input("max_students", sql.Int, data.max_students ?? 10)
        .input("specializations", sql.NVarChar(sql.MAX), specializationsStr)
        .execute("sp_CreateSupervisor");

      return result.recordset[0];
    } catch (error: any) {
      console.error("Error creating supervisor:", {
        message: error.message,
        number: error.number,
        state: error.state,
        class: error.class,
        serverName: error.serverName,
        procName: error.procName,
        lineNumber: error.lineNumber,
      });
      throw error;
    }
  },

  /**
   * Update an existing supervisor
   */
  async update(data: UpdateSupervisorInput): Promise<any> {
    const pool = getPool();

    // Convert specializations to plain string if it's an array
    let specializationsStr = undefined;
    if (data.specializations !== undefined) {
      if (Array.isArray(data.specializations)) {
        specializationsStr = data.specializations.join(", ");
      } else if (typeof data.specializations === "string") {
        specializationsStr = data.specializations;
      }
    }

    const result = await pool
      .request()
      .input("id", sql.NVarChar(50), data.id)
      .input("email", sql.NVarChar(255), data.email ?? null)
      .input("full_name", sql.NVarChar(255), data.full_name ?? null)
      .input("phone", sql.NVarChar(20), data.phone ?? null)
      .input("avatar_url", sql.NVarChar(sql.MAX), data.avatar_url ?? null)
      .input("department", sql.Int, data.department ?? null)
      .input("lecturer_type", sql.NVarChar(100), data.lecturer_type ?? null)
      .input("title", sql.NVarChar(100), data.title ?? null)
      .input("max_students", sql.Int, data.max_students ?? null)
      .input(
        "specializations",
        sql.NVarChar(sql.MAX),
        specializationsStr ?? null
      )
      .execute("sp_UpdateSupervisor");
    return result.recordset[0];
  },

  /**
   * Delete a supervisor
   */
  async delete(id: string): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.NVarChar(50), id)
      .execute("sp_DeleteSupervisor");
  },
};
