import sql from "mssql";
import { getPool } from "../database/connection";

export interface StudentProfile {
  id?: number;
  student_id: number;
  contact_info?: string;
  guardian_info?: string;
  residence_address?: string;
  family_circumstances?: string;
  awards?: string;
  disciplinary?: string;
  activities?: string;
  health_status?: string;
  academic_advisor_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentProfileInput {
  student_id: number;
  contact_info?: string;
  guardian_info?: string;
  residency_type?: string;
  residency_details?: string;
  residence_address?: string;
  family_circumstances?: string;
  awards?: string;
  disciplinary?: string;
  activities?: string;
  health_status?: string;
  academic_advisor_id?: string;
}

// Update by student_id (table uses student_id as primary key)
export interface UpdateStudentProfileInput extends Partial<CreateStudentProfileInput> {
  student_id: number;
}

export const studentProfilesRepository = {
  async getByStudentId(student_id: number): Promise<StudentProfile | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", sql.Int, student_id)
      .execute("sp_GetStudentProfileByStudentId");
    return result.recordset[0] || null;
  },

  async create(data: CreateStudentProfileInput): Promise<StudentProfile> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", sql.Int, data.student_id)
      .input("contact_info", sql.NVarChar(sql.MAX), data.contact_info ?? null)
      .input("guardian_info", sql.NVarChar(sql.MAX), data.guardian_info ?? null)
      .input("residency_type", sql.NVarChar(50), data.residency_type ?? null)
      .input(
        "residency_details",
        sql.NVarChar(sql.MAX),
        data.residency_details ?? null
      )
      .input(
        "residence_address",
        sql.NVarChar(500),
        data.residence_address ?? null
      )
      .input(
        "family_circumstances",
        sql.NVarChar(sql.MAX),
        data.family_circumstances ?? null
      )
      .input("awards", sql.NVarChar(sql.MAX), data.awards ?? null)
      .input("disciplinary", sql.NVarChar(sql.MAX), data.disciplinary ?? null)
      .input("activities", sql.NVarChar(sql.MAX), data.activities ?? null)
      .input("health_status", sql.NVarChar(255), data.health_status ?? null)
      .input(
        "academic_advisor_id",
        sql.NVarChar(50),
        data.academic_advisor_id ?? null
      )
      .execute("sp_CreateStudentProfile");
    return result.recordset[0];
  },

  async update(data: UpdateStudentProfileInput): Promise<StudentProfile> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", sql.Int, data.student_id)
      .input("contact_info", sql.NVarChar(sql.MAX), data.contact_info ?? null)
      .input("guardian_info", sql.NVarChar(sql.MAX), data.guardian_info ?? null)
      .input(
        "residency_type",
        sql.NVarChar(50),
        (data as any).residency_type ?? null
      )
      .input(
        "residency_details",
        sql.NVarChar(sql.MAX),
        (data as any).residency_details ?? null
      )
      .input(
        "residence_address",
        sql.NVarChar(500),
        data.residence_address ?? null
      )
      .input(
        "family_circumstances",
        sql.NVarChar(sql.MAX),
        data.family_circumstances ?? null
      )
      .input("awards", sql.NVarChar(sql.MAX), data.awards ?? null)
      .input("disciplinary", sql.NVarChar(sql.MAX), data.disciplinary ?? null)
      .input("activities", sql.NVarChar(sql.MAX), data.activities ?? null)
      .input("health_status", sql.NVarChar(255), data.health_status ?? null)
      .input(
        "academic_advisor_id",
        sql.NVarChar(50),
        data.academic_advisor_id ?? null
      )
      .execute("sp_UpdateStudentProfile");
    return result.recordset[0];
  },

  async delete(student_id: number): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("student_id", sql.Int, student_id)
      .execute("sp_DeleteStudentProfile");
  },
};

export default studentProfilesRepository;
