import sql from "mssql";
import { getPool } from "../database/connection";

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: number;
}

export const companiesRepository = {
  async getAll(is_active?: boolean): Promise<Company[]> {
    const pool = getPool();
    const req = pool.request();
    req.input("is_active", sql.Bit, is_active ?? null);
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
    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), data.name)
      .input("address", sql.NVarChar(500), data.address ?? null)
      .input("phone", sql.NVarChar(20), data.phone ?? null)
      .input("email", sql.NVarChar(255), data.email ?? null)
      .input("contact_person", sql.NVarChar(255), data.contact_person ?? null)
      .input("contact_phone", sql.NVarChar(20), data.contact_phone ?? null)
      .input("website", sql.NVarChar(255), data.website ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .input("is_active", sql.Bit, data.is_active ?? true)
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
      .input("contact_person", sql.NVarChar(255), data.contact_person ?? null)
      .input("contact_phone", sql.NVarChar(20), data.contact_phone ?? null)
      .input("website", sql.NVarChar(255), data.website ?? null)
      .input("description", sql.NVarChar(sql.MAX), data.description ?? null)
      .input("is_active", sql.Bit, data.is_active ?? null)
      .execute("sp_UpdateCompany");

    return result.recordset[0];
  },

  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteCompany");
  },
};

export default companiesRepository;
