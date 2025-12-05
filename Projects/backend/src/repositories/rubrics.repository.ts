import { getPool } from "../database/connection";

export interface RubricCriterion {
  id: number;
  rubric_id: number;
  name: string;
  description?: string | null;
  PLO?: string | null;
  PI?: string | null;
  CLO?: string | null;
  max_score: number;
  weight?: number | null;
  order_index: number;
  created_at?: string;
}

export interface Rubric {
  id: number;
  name: string;
  rubric_type: string;
  description?: string | null;
  total_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RubricWithCriteria extends Rubric {
  criteria: RubricCriterion[];
}

export class RubricsRepository {
  static async listRubrics(params: {
    page?: number;
    pageSize?: number;
    rubric_type?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const pool = await getPool();
    const request = pool.request();
    request.input("page", params.page ?? 1);
    request.input("pageSize", params.pageSize ?? 10);
    request.input("rubric_type", params.rubric_type ?? null);
    request.input("search", params.search ?? null);
    request.input("isActive", params.isActive ?? null);

    const result = await request.execute("sp_GetRubrics");
    const resources = result.recordsets[0];
    const total = result.recordsets[1][0]?.total ?? 0;
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return { rubrics: resources, total, page, pageSize, totalPages };
  }

  static async getRubricById(id: number): Promise<RubricWithCriteria | null> {
    const pool = await getPool();
    const request = pool.request();
    request.input("id", id);
    const result = await request.execute("sp_GetRubricById");

    const rubric = result.recordsets[0][0];
    if (!rubric) return null;
    const criteria = result.recordsets[1] ?? [];
    return { ...rubric, criteria };
  }

  static async createRubric(data: {
    name: string;
    rubric_type: string;
    description?: string | null;
    total_score?: number;
    is_active?: boolean;
  }): Promise<number> {
    const pool = await getPool();
    const request = pool.request();
    request.input("name", data.name);
    request.input("rubric_type", data.rubric_type);
    request.input("description", data.description ?? null);
    request.input("total_score", data.total_score ?? 100);
    request.input("is_active", data.is_active ?? true);

    const result = await request.execute("sp_CreateRubric");
    return result.recordset[0].id;
  }

  static async updateRubric(
    id: number,
    data: {
      name: string;
      rubric_type: string;
      description?: string | null;
      total_score?: number;
      is_active?: boolean;
    }
  ): Promise<boolean> {
    const pool = await getPool();
    const request = pool.request();
    request.input("id", id);
    request.input("name", data.name);
    request.input("rubric_type", data.rubric_type);
    request.input("description", data.description ?? null);
    request.input("total_score", data.total_score ?? 100);
    request.input("is_active", data.is_active ?? true);

    const result = await request.execute("sp_UpdateRubric");
    return (result.recordset?.[0]?.affected ?? 0) > 0;
  }

  static async deleteRubric(id: number): Promise<boolean> {
    const pool = await getPool();
    const request = pool.request();
    request.input("id", id);
    const result = await request.execute("sp_DeleteRubric");
    return (result.recordset?.[0]?.affected ?? 0) > 0;
  }

  static async addCriterion(data: {
    rubric_id: number;
    name: string;
    description?: string | null;
    PLO?: string | null;
    PI?: string | null;
    CLO?: string | null;
    max_score: number;
    weight?: number | null;
    order_index?: number;
  }): Promise<number> {
    const pool = await getPool();
    const request = pool.request();
    request.input("rubric_id", data.rubric_id);
    request.input("name", data.name);
    request.input("description", data.description ?? null);
    request.input("PLO", data.PLO ?? null);
    request.input("PI", data.PI ?? null);
    request.input("CLO", data.CLO ?? null);
    request.input("max_score", data.max_score);
    request.input("weight", data.weight ?? null);
    request.input("order_index", data.order_index ?? 0);

    const result = await request.execute("sp_AddRubricCriterion");
    return result.recordset[0].id;
  }

  static async updateCriterion(
    id: number,
    data: {
      name: string;
      description?: string | null;
      PLO?: string | null;
      PI?: string | null;
      CLO?: string | null;
      max_score: number;
      weight?: number | null;
      order_index?: number;
    }
  ): Promise<boolean> {
    const pool = await getPool();
    const request = pool.request();
    request.input("id", id);
    request.input("name", data.name);
    request.input("description", data.description ?? null);
    request.input("PLO", data.PLO ?? null);
    request.input("PI", data.PI ?? null);
    request.input("CLO", data.CLO ?? null);
    request.input("max_score", data.max_score);
    request.input("weight", data.weight ?? null);
    request.input("order_index", data.order_index ?? 0);

    const result = await request.execute("sp_UpdateRubricCriterion");
    return (result.recordset?.[0]?.affected ?? 0) > 0;
  }

  static async deleteCriterion(id: number): Promise<boolean> {
    const pool = await getPool();
    const request = pool.request();
    request.input("id", id);
    const result = await request.execute("sp_DeleteRubricCriterion");
    return (result.recordset?.[0]?.affected ?? 0) > 0;
  }

  static async listCriteriaByRubric(
    rubric_id: number
  ): Promise<RubricCriterion[]> {
    const pool = await getPool();
    const request = pool.request();
    request.input("rubric_id", rubric_id);
    const result = await request.execute("sp_GetRubricCriteriaByRubricId");
    return result.recordset ?? [];
  }
}
