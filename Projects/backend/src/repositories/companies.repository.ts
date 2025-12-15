import sql from "mssql";
import { getPool } from "../database/connection";

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  external_id?: string;
  manager_name?: string;
  manager_phone?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  company_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  external_id?: string;
  manager_name?: string;
  manager_phone?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  company_type?: string;
  is_active?: boolean;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: number;
}

export const companiesRepository = {
  async getAll(company_type?: string): Promise<Company[]> {
    const pool = getPool();
    const req = pool.request();
    req.input("company_type", sql.NVarChar(50), company_type ?? null);
    const result = await req.execute("sp_GetAllCompanies");
    return result.recordset || [];
  },

  async getById(id: number): Promise<Company | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetCompanyById");
    return result.recordset[0] || null;
  },
  async create(data: CreateCompanyInput): Promise<Company> {
    const pool = getPool();
    // Auto-generate external_id when not provided.
    if (!data.external_id) {
      const type = (data.company_type ?? "").toString().toLowerCase();
      const isLhu = type.includes("lhu");
      const prefix = isLhu ? "LHU" : "ext";

      // Find the highest numeric suffix for this prefix
      const req = pool.request();
      req.input("prefix", sql.NVarChar(10), prefix + "%");
      req.input("startPos", sql.Int, prefix.length + 1);
      const q = `SELECT TOP 1 external_id FROM companies WHERE UPPER(external_id) LIKE UPPER(@prefix) ORDER BY TRY_CAST(SUBSTRING(external_id,@startPos,10) AS INT) DESC`;
      const r = await req.query(q);
      const last =
        r.recordset && r.recordset[0] ? r.recordset[0].external_id : null;
      let nextNum = 1;
      if (last) {
        const numPart = last.substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) nextNum = parsed + 1;
      }
      const nextStr = String(nextNum).padStart(3, "0");
      data.external_id = `${prefix}${nextStr}`;
    }
    const result = await pool
      .request()
      .input("external_id", sql.NVarChar(100), data.external_id ?? null)
      .input("name", sql.NVarChar(255), data.name)
      .input("address", sql.NVarChar(500), data.address ?? null)
      .input("phone", sql.NVarChar(20), data.phone ?? null)
      .input("email", sql.NVarChar(255), data.email ?? null)
      .input(
        "contact_person",
        sql.NVarChar(255),
        data.contact_person ?? data.manager_name ?? ""
      )
      .input(
        "contact_phone",
        sql.NVarChar(20),
        data.contact_phone ?? data.manager_phone ?? null
      )
      .input("website", sql.NVarChar(255), data.website ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .input("company_type", sql.NVarChar(250), data.company_type ?? null)
      .input("manager_name", sql.NVarChar(250), data.manager_name ?? null)
      .input("manager_phone", sql.VarChar(50), data.manager_phone ?? null)
      .execute("sp_CreateCompany");

    return result.recordset[0];
  },

  async update(data: UpdateCompanyInput): Promise<Company> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.NVarChar(255), data.name ?? null)
      .input("address", sql.NVarChar(500), data.address ?? null)
      .input("phone", sql.NVarChar(20), data.phone ?? null)
      .input("email", sql.NVarChar(255), data.email ?? null)
      .input("manager_name", sql.NVarChar(250), data.manager_name ?? null)
      .input("manager_phone", sql.VarChar(50), data.manager_phone ?? null)
      .input(
        "contact_person",
        sql.NVarChar(255),
        (data as any).contact_person ?? data.manager_name ?? ""
      )
      .input(
        "contact_phone",
        sql.NVarChar(20),
        (data as any).contact_phone ?? data.manager_phone ?? null
      )
      .input("website", sql.NVarChar(255), data.website ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .input("company_type", sql.NVarChar(250), data.company_type ?? null)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .input(
        "external_id",
        sql.NVarChar(100),
        (data as any).external_id ?? null
      )
      .execute("sp_UpdateCompany");

    return result.recordset[0];
  },

  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.request().input("id", sql.Int, id).execute("sp_DeleteCompany");
  },
};

export default companiesRepository;
