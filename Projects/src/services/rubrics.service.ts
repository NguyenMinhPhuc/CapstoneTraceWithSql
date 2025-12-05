import apiClient from "@/lib/api-client";

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
}

export interface Rubric {
  id: number;
  name: string;
  rubric_type: "supervisor" | "council" | "reviewer" | "early_internship";
  description?: string | null;
  total_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  criteria_count?: number;
}

export interface RubricWithCriteria extends Rubric {
  criteria: RubricCriterion[];
}

export interface RubricsResponse {
  rubrics: Rubric[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const rubricsService = {
  async listRubrics(
    params: {
      page?: number;
      pageSize?: number;
      rubric_type?: Rubric["rubric_type"];
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<RubricsResponse> {
    const query: any = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
    if (params.rubric_type) query.rubric_type = params.rubric_type;
    if (params.search) query.search = params.search;
    if (params.isActive !== undefined) query.isActive = params.isActive;

    const res = await apiClient.get("/rubrics", { params: query });
    return res.data.data;
  },

  async getRubric(id: number): Promise<RubricWithCriteria> {
    const res = await apiClient.get(`/rubrics/${id}`);
    return res.data.data;
  },

  async createRubric(data: {
    name: string;
    rubric_type: Rubric["rubric_type"];
    description?: string | null;
    total_score?: number;
    is_active?: boolean;
  }): Promise<{ id: number }> {
    const res = await apiClient.post("/rubrics", data);
    return res.data.data;
  },

  async updateRubric(
    id: number,
    data: {
      name: string;
      rubric_type: Rubric["rubric_type"];
      description?: string | null;
      total_score?: number;
      is_active?: boolean;
    }
  ): Promise<void> {
    await apiClient.put(`/rubrics/${id}`, data);
  },

  async deleteRubric(id: number): Promise<void> {
    await apiClient.delete(`/rubrics/${id}`);
  },

  async addCriterion(
    rubricId: number,
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
  ): Promise<{ id: number }> {
    const res = await apiClient.post(`/rubrics/${rubricId}/criteria`, data);
    return res.data.data;
  },

  async updateCriterion(
    rubricId: number,
    criterionId: number,
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
  ): Promise<void> {
    await apiClient.put(`/rubrics/${rubricId}/criteria/${criterionId}`, data);
  },

  async deleteCriterion(rubricId: number, criterionId: number): Promise<void> {
    await apiClient.delete(`/rubrics/${rubricId}/criteria/${criterionId}`);
  },
};
