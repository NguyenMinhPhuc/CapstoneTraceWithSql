import sql from "mssql";
import { getPool } from "../database/connection";

export interface InternshipPosition {
  id: number;
  defense_session_id: number;
  company_id: number;
  title: string;
  description?: string;
  capacity: number;
  manager_user_id?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: Date;
  updated_at: Date;
}

export const internshipPositionsRepository = {
  async getBySession(sessionId: number): Promise<InternshipPosition[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("sessionId", sql.Int, sessionId)
      .query(
        `SELECT ip.*, c.name as company_name, c.company_type, u.full_name as manager_name
         FROM dbo.internship_positions ip
         LEFT JOIN dbo.companies c ON ip.company_id = c.id
         LEFT JOIN dbo.users u ON ip.manager_user_id = u.id
         WHERE ip.defense_session_id = @sessionId 
         ORDER BY ip.company_id, ip.id`
      );
    return result.recordset || [];
  },

  async getById(id: number): Promise<InternshipPosition | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT ip.*, c.name as company_name, c.company_type, u.full_name as manager_name
         FROM dbo.internship_positions ip
         LEFT JOIN dbo.companies c ON ip.company_id = c.id
         LEFT JOIN dbo.users u ON ip.manager_user_id = u.id
         WHERE ip.id = @id`
      );
    return result.recordset[0] || null;
  },

  async getByKey(
    sessionId: number,
    companyId: number
  ): Promise<InternshipPosition[]> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("sessionId", sql.Int, sessionId)
      .input("companyId", sql.Int, companyId)
      .query(
        `SELECT * FROM dbo.internship_positions WHERE defense_session_id = @sessionId AND company_id = @companyId ORDER BY id`
      );
    return result.recordset || [];
  },

  async create(data: Partial<InternshipPosition>): Promise<InternshipPosition> {
    const pool = getPool();
    const req = pool.request();
    req.input("defense_session_id", sql.Int, data.defense_session_id as number);
    req.input("company_id", sql.Int, data.company_id as number);
    req.input("title", sql.NVarChar(255), data.title ?? null);
    req.input("description", sql.NVarChar(sql.MAX), data.description ?? null);
    req.input("capacity", sql.Int, data.capacity ?? 1);
    req.input(
      "manager_user_id",
      sql.NVarChar(50),
      data.manager_user_id ?? null
    );
    req.input("is_active", sql.Bit, data.is_active ?? true);
    req.input("created_by", sql.NVarChar(50), data.created_by ?? null);
    const q = `INSERT INTO dbo.internship_positions (defense_session_id, company_id, title, description, capacity, manager_user_id, is_active, created_by, created_at, updated_at)
VALUES (@defense_session_id, @company_id, @title, @description, @capacity, @manager_user_id, @is_active, @created_by, SYSUTCDATETIME(), SYSUTCDATETIME());
SELECT * FROM dbo.internship_positions WHERE id = SCOPE_IDENTITY();`;

    const result = await req.query(q);
    return result.recordset[0];
  },

  async update(
    id: number,
    data: Partial<InternshipPosition>
  ): Promise<InternshipPosition> {
    const pool = getPool();
    const req = pool.request();
    req.input("id", sql.Int, id);
    req.input("title", sql.NVarChar(255), (data.title as any) ?? null);
    req.input("description", sql.NVarChar(sql.MAX), data.description ?? null);
    req.input("capacity", sql.Int, data.capacity ?? null);
    req.input(
      "manager_user_id",
      sql.NVarChar(50),
      data.manager_user_id ?? null
    );
    req.input("is_active", sql.Bit, data.is_active ?? null);

    const q = `UPDATE dbo.internship_positions SET
      title = COALESCE(@title, title),
      description = COALESCE(@description, description),
      capacity = COALESCE(@capacity, capacity),
      manager_user_id = COALESCE(@manager_user_id, manager_user_id),
      is_active = COALESCE(@is_active, is_active),
      updated_at = SYSUTCDATETIME()
    WHERE id = @id;
    SELECT * FROM dbo.internship_positions WHERE id = @id;`;

    const result = await req.query(q);
    return result.recordset[0];
  },

  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM dbo.internship_positions WHERE id = @id");
  },
};

export default internshipPositionsRepository;
