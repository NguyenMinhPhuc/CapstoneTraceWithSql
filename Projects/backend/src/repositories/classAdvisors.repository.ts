import sql from "mssql";
import { getPool } from "../database/connection";

export interface ClassAdvisor {
  id: number;
  class_id: number;
  class_name?: string;
  class_code?: string;
  major_id?: number;
  major_name?: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  teacher_phone?: string;
  teacher_type: string;
  semester: string;
  academic_year: string;
  assigned_date: Date;
  assigned_by?: string;
  assigned_by_name?: string;
  is_active: boolean;
  end_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  student_count?: number;
  profile_count?: number;
  days_served?: number;
}

export interface CreateClassAdvisorInput {
  class_id: number;
  teacher_id: string;
  teacher_type?: string;
  semester: string;
  academic_year: string;
  assigned_by?: string;
  notes?: string;
}

export interface UpdateClassAdvisorInput {
  id: number;
  notes?: string;
  is_active?: boolean;
}

export interface AdvisorProfile {
  id: number;
  advisor_id: number;
  class_id?: number;
  class_name?: string;
  class_code?: string;
  semester?: string;
  academic_year?: string;
  teacher_id?: string;
  teacher_name?: string;
  profile_type: string;
  title?: string;
  content?: string;
  profile_data?: string; // JSON string
  attachments?: string; // JSON array of URLs
  created_by?: string;
  created_by_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAdvisorProfileInput {
  advisor_id: number;
  profile_type?: string;
  title?: string;
  content?: string;
  profile_data?: string;
  attachments?: string;
  created_by?: string;
}

export const classAdvisorsRepository = {
  /**
   * Assign class advisor
   */
  async assign(data: CreateClassAdvisorInput): Promise<ClassAdvisor> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("class_id", sql.Int, data.class_id)
      .input("teacher_id", sql.NVarChar(50), data.teacher_id)
      .input(
        "teacher_type",
        sql.NVarChar(20),
        data.teacher_type || "supervisor"
      )
      .input("semester", sql.NVarChar(20), data.semester)
      .input("academic_year", sql.NVarChar(20), data.academic_year)
      .input("assigned_by", sql.NVarChar(50), data.assigned_by ?? null)
      .input("notes", sql.NVarChar(sql.MAX), data.notes ?? null)
      .execute("sp_AssignClassAdvisor");
    return result.recordset[0];
  },

  /**
   * Get class advisors with filters
   */
  async getAll(
    classId?: number,
    teacherId?: string,
    semester?: string,
    academicYear?: string,
    isActive?: boolean
  ): Promise<ClassAdvisor[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("class_id", sql.Int, classId ?? null)
      .input("teacher_id", sql.NVarChar(50), teacherId ?? null)
      .input("semester", sql.NVarChar(20), semester ?? null)
      .input("academic_year", sql.NVarChar(20), academicYear ?? null)
      .input("is_active", sql.Bit, isActive ?? null)
      .execute("sp_GetClassAdvisors");
    return result.recordset;
  },

  /**
   * Get advisor assignment history for a class
   */
  async getHistory(classId: number): Promise<ClassAdvisor[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("class_id", sql.Int, classId)
      .execute("sp_GetClassAdvisorHistory");
    return result.recordset;
  },

  /**
   * Update class advisor
   */
  async update(data: UpdateClassAdvisorInput): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("notes", sql.NVarChar(sql.MAX), data.notes ?? null)
      .input("is_active", sql.Bit, data.is_active ?? null)
      .execute("sp_UpdateClassAdvisor");
  },

  /**
   * Delete class advisor assignment
   */
  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteClassAdvisor");
  },

  /**
   * Add advisor profile entry
   */
  async addProfile(data: CreateAdvisorProfileInput): Promise<AdvisorProfile> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("advisor_id", sql.Int, data.advisor_id)
      .input("profile_type", sql.NVarChar(50), data.profile_type || "general")
      .input("title", sql.NVarChar(255), data.title ?? null)
      .input("content", sql.NVarChar(sql.MAX), data.content ?? null)
      .input("profile_data", sql.NVarChar(sql.MAX), data.profile_data ?? null)
      .input("attachments", sql.NVarChar(sql.MAX), data.attachments ?? null)
      .input("created_by", sql.NVarChar(50), data.created_by ?? null)
      .execute("sp_AddAdvisorProfile");
    return result.recordset[0];
  },

  /**
   * Get advisor profiles
   */
  async getProfiles(
    advisorId?: number,
    classId?: number,
    profileType?: string
  ): Promise<AdvisorProfile[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("advisor_id", sql.Int, advisorId ?? null)
      .input("class_id", sql.Int, classId ?? null)
      .input("profile_type", sql.NVarChar(50), profileType ?? null)
      .execute("sp_GetAdvisorProfiles");
    return result.recordset;
  },
};
