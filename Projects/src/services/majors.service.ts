import apiClient from "@/lib/api-client";

export interface Major {
  id: number;
  code: string;
  name: string;
  description?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMajorInput {
  code: string;
  name: string;
  description?: string;
  department_id?: number;
  is_active?: boolean;
}

export interface UpdateMajorInput extends CreateMajorInput {
  id: number;
}

export const majorsService = {
  /**
   * Get all majors
   */
  async getAll(departmentId?: number, isActive?: boolean): Promise<Major[]> {
    const params = new URLSearchParams();
    if (departmentId !== undefined) {
      params.append("department_id", departmentId.toString());
    }
    if (isActive !== undefined) {
      params.append("is_active", isActive.toString());
    }
    const response = await apiClient.get(`/majors?${params.toString()}`);
    return response.data;
  },

  /**
   * Get major by ID
   */
  async getById(id: number): Promise<Major> {
    const response = await apiClient.get(`/majors/${id}`);
    return response.data;
  },

  /**
   * Create new major
   */
  async create(data: CreateMajorInput): Promise<Major> {
    const response = await apiClient.post("/majors", data);
    return response.data;
  },

  /**
   * Update major
   */
  async update(id: number, data: CreateMajorInput): Promise<Major> {
    const response = await apiClient.put(`/majors/${id}`, data);
    return response.data;
  },

  /**
   * Delete major
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/majors/${id}`);
  },
};
