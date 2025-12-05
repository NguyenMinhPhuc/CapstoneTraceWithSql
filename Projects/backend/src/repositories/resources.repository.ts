import { getPool } from "../database/connection";
import sql from "mssql";

export interface Resource {
  id: number;
  name: string;
  summary?: string;
  category: string;
  resource_type?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  links_count?: number;
}

export interface ResourceLink {
  id: number;
  resource_id: number;
  label: string;
  url: string;
  order_index: number;
  created_at: string;
}

export interface ResourceWithLinks extends Resource {
  links: ResourceLink[];
}

export class ResourcesRepository {
  static async getResources(
    page: number = 1,
    pageSize: number = 10,
    category?: string,
    search?: string,
    isActive?: boolean
  ): Promise<{ resources: Resource[]; total: number }> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("page", sql.Int, page)
      .input("pageSize", sql.Int, pageSize)
      .input("category", sql.NVarChar(50), category)
      .input("search", sql.NVarChar(255), search)
      .input("isActive", sql.Bit, isActive)
      .execute("sp_GetResources");

    const resources = result.recordsets[0] as Resource[];
    const total = result.recordsets[1][0]?.total || 0;

    return { resources, total };
  }

  static async getResourceById(id: number): Promise<ResourceWithLinks | null> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_GetResourceById");

    if (!result.recordsets[0] || result.recordsets[0].length === 0) {
      return null;
    }

    const resource = result.recordsets[0][0] as Resource;
    const links = (result.recordsets[1] || []) as ResourceLink[];

    return { ...resource, links };
  }

  static async createResource(data: {
    name: string;
    summary?: string;
    category: string;
    resource_type?: string;
    created_by: string;
    is_active?: boolean;
  }): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), data.name)
      .input("summary", sql.NVarChar(sql.MAX), data.summary)
      .input("category", sql.NVarChar(50), data.category)
      .input("resource_type", sql.NVarChar(50), data.resource_type)
      .input("created_by", sql.NVarChar(50), data.created_by)
      .input("is_active", sql.Bit, data.is_active ?? true)
      .execute("sp_CreateResource");

    return result.recordset[0].id;
  }

  static async updateResource(
    id: number,
    data: {
      name: string;
      summary?: string;
      category: string;
      resource_type?: string;
      is_active: boolean;
    }
  ): Promise<boolean> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(255), data.name)
      .input("summary", sql.NVarChar(sql.MAX), data.summary)
      .input("category", sql.NVarChar(50), data.category)
      .input("resource_type", sql.NVarChar(50), data.resource_type)
      .input("is_active", sql.Bit, data.is_active)
      .execute("sp_UpdateResource");

    return result.recordset[0].affected_rows > 0;
  }

  static async deleteResource(id: number): Promise<boolean> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteResource");

    return result.recordset[0].affected_rows > 0;
  }

  static async addResourceLink(data: {
    resource_id: number;
    label: string;
    url: string;
    order_index?: number;
  }): Promise<number> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("resource_id", sql.Int, data.resource_id)
      .input("label", sql.NVarChar(255), data.label)
      .input("url", sql.NVarChar(1000), data.url)
      .input("order_index", sql.Int, data.order_index ?? 0)
      .execute("sp_AddResourceLink");

    return result.recordset[0].id;
  }

  static async updateResourceLink(
    id: number,
    data: {
      label: string;
      url: string;
      order_index: number;
    }
  ): Promise<boolean> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("label", sql.NVarChar(255), data.label)
      .input("url", sql.NVarChar(1000), data.url)
      .input("order_index", sql.Int, data.order_index)
      .execute("sp_UpdateResourceLink");

    return result.recordset[0].affected_rows > 0;
  }

  static async deleteResourceLink(id: number): Promise<boolean> {
    const pool = getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .execute("sp_DeleteResourceLink");

    return result.recordset[0].affected_rows > 0;
  }
}

export default ResourcesRepository;
