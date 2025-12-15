import sql from "mssql";
import { getPool } from "../database/connection";

export interface DefenseSession {
  id: number;
  name: string;
  session_type: string;
  start_date?: string | null;
  registration_deadline?: string | null;
  submission_deadline?: string | null;
  expected_date?: string | null;
  description?: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  session_type_name?: string;
  linh_group?: string | null;
  council_score_ratio?: number | null;
  supervisor_score_ratio?: number | null;
  submission_folder_link?: string | null;
  submission_description?: string | null;
  council_rubric_id?: number | null;
  supervisor_rubric_id?: number | null;
}

export interface CreateDefenseInput {
  name: string;
  session_type: string;
  start_date?: string | null;
  registration_deadline?: string | null;
  submission_deadline?: string | null;
  expected_date?: string | null;
  description?: string | null;
  status?: string;
  linh_group?: string | null;
  council_score_ratio?: number | null;
  supervisor_score_ratio?: number | null;
  submission_folder_link?: string | null;
  submission_description?: string | null;
  council_rubric_id?: number | null;
  supervisor_rubric_id?: number | null;
}

export interface UpdateDefenseInput extends Partial<CreateDefenseInput> {
  id: number;
}

export const defenseRepository = {
  async getSessionTypes() {
    const pool = getPool();
    const result = await pool.request().execute("sp_GetDefenseSessionTypes");
    return result.recordset || [];
  },

  async getRubrics(type?: string) {
    const pool = getPool();
    const request = pool.request();
    request.input("page", sql.Int, 1);
    request.input("pageSize", sql.Int, 1000); // Large number to get all rubrics
    if (type) {
      request.input("rubric_type", sql.NVarChar(50), type);
    }
    const result = await request.execute("sp_GetRubrics");
    return result.recordset || []; // First result set is the rubrics
  },

  async getAll(session_type?: string | null, status?: string | null) {
    const pool = getPool();
    const request = pool.request();
    request.input("session_type", sql.NVarChar(100), session_type ?? null);
    request.input("status", sql.NVarChar(50), status ?? null);
    const result = await request.execute("sp_GetAllDefenseSessions");
    return result.recordset || [];
  },

  async getById(id: number) {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetDefenseSessionById");
    return result.recordset[0];
  },

  async create(data: CreateDefenseInput) {
    const pool = getPool();
    const request = pool.request();
    request.input("name", sql.NVarChar(255), data.name);
    request.input("session_type", sql.NVarChar(50), data.session_type);
    request.input("start_date", sql.Date, data.start_date ?? null);
    request.input(
      "registration_deadline",
      sql.Date,
      data.registration_deadline ?? null
    );
    request.input(
      "submission_deadline",
      sql.Date,
      data.submission_deadline ?? null
    );
    request.input("expected_date", sql.Date, data.expected_date ?? null);
    request.input(
      "description",
      sql.NVarChar(sql.MAX),
      data.description ?? null
    );
    request.input("status", sql.NVarChar(50), data.status ?? "scheduled");
    request.input("linh_group", sql.NVarChar(50), data.linh_group ?? null);
    request.input(
      "council_score_ratio",
      sql.Int,
      data.council_score_ratio ?? null
    );
    request.input(
      "supervisor_score_ratio",
      sql.Int,
      data.supervisor_score_ratio ?? null
    );
    request.input(
      "submission_folder_link",
      sql.NVarChar(500),
      data.submission_folder_link ?? null
    );
    request.input(
      "submission_description",
      sql.NVarChar(sql.MAX),
      data.submission_description ?? null
    );
    request.input("council_rubric_id", sql.Int, data.council_rubric_id ?? null);
    request.input(
      "supervisor_rubric_id",
      sql.Int,
      data.supervisor_rubric_id ?? null
    );

    const result = await request.execute("sp_CreateDefenseSession");
    return result.recordset[0];
  },

  async update(data: UpdateDefenseInput) {
    const pool = getPool();
    const request = pool.request();
    request.input("id", sql.Int, data.id);
    request.input("name", sql.NVarChar(255), data.name ?? null);
    request.input("session_type", sql.NVarChar(50), data.session_type ?? null);
    request.input("start_date", sql.Date, data.start_date ?? null);
    request.input(
      "registration_deadline",
      sql.Date,
      data.registration_deadline ?? null
    );
    request.input(
      "submission_deadline",
      sql.Date,
      data.submission_deadline ?? null
    );
    request.input("expected_date", sql.Date, data.expected_date ?? null);
    request.input(
      "description",
      sql.NVarChar(sql.MAX),
      data.description ?? null
    );
    request.input("status", sql.NVarChar(50), data.status ?? null);
    request.input("linh_group", sql.NVarChar(255), data.linh_group ?? null);
    request.input(
      "council_score_ratio",
      sql.Decimal(5, 2),
      data.council_score_ratio ?? null
    );
    request.input(
      "supervisor_score_ratio",
      sql.Decimal(5, 2),
      data.supervisor_score_ratio ?? null
    );
    request.input(
      "submission_folder_link",
      sql.NVarChar(500),
      data.submission_folder_link ?? null
    );
    request.input(
      "submission_description",
      sql.NVarChar(sql.MAX),
      data.submission_description ?? null
    );
    request.input("council_rubric_id", sql.Int, data.council_rubric_id ?? null);
    request.input(
      "supervisor_rubric_id",
      sql.Int,
      data.supervisor_rubric_id ?? null
    );

    const result = await request.execute("sp_UpdateDefenseSession");
    return result.recordset[0];
  },

  async delete(id: number) {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteDefenseSession");
  },

  async createRegistration(payload: {
    session_id: number;
    student_id: number;
    student_code?: string | null;
    student_name?: string | null;
    class_name?: string | null;
    graduation_status?: string | null;
    internship_status?: string | null;
    report_status?: string | null;
  }) {
    const pool = getPool();
    const request = pool.request();
    request.input("session_id", sql.Int, payload.session_id);
    request.input("student_id", sql.Int, payload.student_id);
    request.input(
      "student_code",
      sql.NVarChar(50),
      payload.student_code ?? null
    );
    request.input(
      "student_name",
      sql.NVarChar(255),
      payload.student_name ?? null
    );
    request.input("class_name", sql.NVarChar(100), payload.class_name ?? null);
    request.input(
      "graduation_status",
      sql.NVarChar(50),
      payload.graduation_status ?? null
    );
    request.input(
      "internship_status",
      sql.NVarChar(50),
      payload.internship_status ?? null
    );
    request.input(
      "report_status",
      sql.NVarChar(50),
      payload.report_status ??
        payload.graduation_status ??
        payload.internship_status ??
        null
    );

    const result = await request.execute("sp_CreateDefenseRegistration");
    return result.recordset[0];
  },

  async getRegistrationsBySession(sessionId: number) {
    const pool = getPool();
    const result = await pool
      .request()
      .input("session_id", sql.Int, sessionId)
      .execute("sp_GetDefenseRegistrationsBySession");
    return result.recordset || [];
  },

  async deleteRegistration(id: number) {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteDefenseRegistration");
    // result.recordset[0].rowsAffected may be returned as rowsAffected column
    return result.recordset && result.recordset.length
      ? result.recordset[0]
      : { rowsAffected: 0 };
  },
  async updateRegistration(
    id: number,
    payload: {
      graduation_status?: string | null;
      graduation_status_note?: string | null;
      internship_status?: string | null;
      internship_status_note?: string | null;
      report_status?: string | null;
      report_status_note?: string | null;
    }
  ) {
    const pool = getPool();
    const request = pool.request();
    request.input("id", sql.Int, id);
    request.input(
      "graduation_status",
      sql.NVarChar(50),
      payload.graduation_status ?? null
    );
    request.input(
      "graduation_status_note",
      sql.NVarChar(sql.MAX),
      payload.graduation_status_note ?? null
    );
    request.input(
      "internship_status",
      sql.NVarChar(50),
      payload.internship_status ?? null
    );
    request.input(
      "internship_status_note",
      sql.NVarChar(sql.MAX),
      payload.internship_status_note ?? null
    );
    request.input(
      "report_status",
      sql.NVarChar(50),
      payload.report_status ??
        payload.graduation_status ??
        payload.internship_status ??
        null
    );
    request.input(
      "report_status_note",
      sql.NVarChar(sql.MAX),
      payload.report_status_note ??
        payload.graduation_status_note ??
        payload.internship_status_note ??
        null
    );

    const result = await request.execute("sp_UpdateDefenseRegistration");
    return result.recordset && result.recordset.length
      ? result.recordset[0]
      : null;
  },
};
