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
  changed_by?: string;
  change_notes?: string;
}

export interface ProfileStatusHistory {
  id: number;
  student_id: number;
  old_status?: string;
  new_status: string;
  changed_by: string;
  changed_by_name?: string;
  changed_by_email?: string;
  changed_at: Date;
  notes?: string;
  change_type?: string;
  created_at: Date;
}

export interface AddStatusHistoryInput {
  student_id: number;
  old_status?: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  change_type?: string;
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
   * Get paged students with optional search, filters and sort. Also returns has_profile flag and total count.
   */
  async getPaged(options: {
    page?: number;
    pageSize?: number;
    q?: string | null;
    className?: string | null;
    profile?: "all" | "has" | "no";
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ rows: Partial<Student>[]; total: number }> {
    const {
      page = 1,
      pageSize = 20,
      q = null,
      className = null,
      profile = "all",
      sortBy = "student_code",
      sortDir = "asc",
    } = options;

    const pool = getPool();
    const request = pool.request();
    request.input("page", sql.Int, page);
    request.input("pageSize", sql.Int, pageSize);
    request.input("q", sql.NVarChar(255), q ?? null);
    request.input("className", sql.NVarChar(255), className ?? null);
    request.input("profile", sql.NVarChar(10), profile ?? "all");
    request.input("sortBy", sql.NVarChar(50), sortBy);
    request.input("sortDir", sql.NVarChar(4), sortDir);

    const result = await request.execute("sp_GetStudentsWithProfilePaged");
    const rows: Partial<Student>[] = (result.recordset || []).map((r: any) => ({
      id: r.id,
      student_code: r.student_code,
      full_name: r.full_name,
      class_name: r.class_name,
      status: r.status,
      user_id: r.user_id,
      // @ts-ignore
      has_profile: !!r.has_profile,
    }));
    const total =
      result.recordset && result.recordset.length > 0
        ? Number(result.recordset[0].total_count)
        : 0;
    return { rows, total };
  },

  /**
   * Get all students matching filters (for export)
   */
  async getForExport(options: {
    q?: string | null;
    className?: string | null;
    profile?: "all" | "has" | "no";
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<Partial<Student>[]> {
    const {
      q = null,
      className = null,
      profile = "all",
      sortBy = "student_code",
      sortDir = "asc",
    } = options;
    const pool = getPool();
    const request = pool.request();
    // Build dynamic WHERE similarly to stored procedure
    const whereClauses: string[] = [];
    if (q) {
      whereClauses.push(
        `(s.student_code LIKE @q OR s.full_name LIKE @q OR c.class_name LIKE @q)`
      );
      request.input("q", sql.NVarChar(255), `%${q}%`);
    }
    if (className) {
      whereClauses.push(`c.class_name = @className`);
      request.input("className", sql.NVarChar(255), className);
    }
    if (profile === "has") {
      whereClauses.push(`sp.student_id IS NOT NULL`);
    } else if (profile === "no") {
      whereClauses.push(`sp.student_id IS NULL`);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const allowedSort = new Set(["student_code", "full_name", "class_name"]);
    const sortCol = allowedSort.has(sortBy) ? sortBy : "student_code";
    const direction = sortDir === "desc" ? "DESC" : "ASC";

    const sqlQuery = `
      SELECT s.id, s.student_code, s.full_name, c.class_name, CASE WHEN sp.student_id IS NULL THEN 0 ELSE 1 END AS has_profile
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN student_profiles sp ON sp.student_id = s.id
      ${whereSql}
      ORDER BY ${sortCol} ${direction};
    `;

    const result = await request.query(sqlQuery);
    return (result.recordset || []).map((r: any) => ({
      id: r.id,
      student_code: r.student_code,
      full_name: r.full_name,
      class_name: r.class_name,
      // @ts-ignore
      has_profile: !!r.has_profile,
    }));
  },

  /**
   * Get statistics: total students and counts per major and per status
   */
  async getStats(options?: {
    className?: string | null;
  }): Promise<{ total: number; majors: Array<any> }> {
    const pool = getPool();
    const request = pool.request();

    // optional class filter
    if (options?.className) {
      request.input("className", sql.NVarChar(255), options.className);
    }

    // total
    const totalQuery = options?.className
      ? `SELECT COUNT(1) AS total FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE c.name = @className`
      : `SELECT COUNT(1) AS total FROM students`;
    const totalRes = await pool.request().query(totalQuery);
    const total = totalRes.recordset[0]?.total ?? 0;

    // per-major per-status
    const perMajorSql = `
      SELECT ISNULL(m.id, 0) AS major_id, ISNULL(m.name, 'Khác') AS major_name, s.status, COUNT(1) AS cnt
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN majors m ON c.major_id = m.id
      ${options?.className ? "WHERE c.name = @className" : ""}
      GROUP BY ISNULL(m.id, 0), ISNULL(m.name, 'Khác'), s.status
      ORDER BY ISNULL(m.name, 'Khác'), s.status;
    `;
    const perMajorRes = await request.query(perMajorSql);

    const majorsMap: Record<string, any> = {};
    for (const r of perMajorRes.recordset || []) {
      const mid = String(r.major_id);
      if (!majorsMap[mid]) {
        majorsMap[mid] = {
          major_id: r.major_id,
          major_name: r.major_name,
          total: 0,
          statuses: {},
        };
      }
      majorsMap[mid].statuses[r.status ?? "Unknown"] = Number(r.cnt);
      majorsMap[mid].total += Number(r.cnt);
    }

    const majors = Object.values(majorsMap);
    return { total: Number(total), majors };
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
      .input("changed_by", sql.NVarChar(50), data.changed_by ?? null)
      .input("change_notes", sql.NVarChar(sql.MAX), data.change_notes ?? null)
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

  /**
   * Add profile status history record
   */
  async addStatusHistory(
    data: AddStatusHistoryInput
  ): Promise<ProfileStatusHistory> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", sql.Int, data.student_id)
      .input("old_status", sql.NVarChar(50), data.old_status ?? null)
      .input("new_status", sql.NVarChar(50), data.new_status)
      .input("changed_by", sql.NVarChar(50), data.changed_by)
      .input("notes", sql.NVarChar(sql.MAX), data.notes ?? null)
      .input(
        "change_type",
        sql.NVarChar(50),
        data.change_type ?? "status_change"
      )
      .execute("sp_AddProfileStatusHistory");
    return result.recordset[0];
  },

  /**
   * Get profile status history for a student
   */
  async getStatusHistory(
    studentId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ history: ProfileStatusHistory[]; total: number }> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("student_id", sql.Int, studentId)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset)
      .execute("sp_GetProfileStatusHistory");

    return {
      history: result.recordsets[0] || [],
      total: result.recordsets[1]?.[0]?.total_count || 0,
    };
  },

  /**
   * Get all profile status history (for admin reporting)
   */
  async getAllStatusHistory(
    startDate?: Date,
    endDate?: Date,
    changeType?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ history: ProfileStatusHistory[]; total: number }> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("start_date", sql.DateTime2, startDate ?? null)
      .input("end_date", sql.DateTime2, endDate ?? null)
      .input("change_type", sql.NVarChar(50), changeType ?? null)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset)
      .execute("sp_GetAllProfileStatusHistory");

    return {
      history: result.recordsets[0] || [],
      total: result.recordsets[1]?.[0]?.total_count || 0,
    };
  },
};
