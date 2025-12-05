import apiClient from "@/lib/api-client";

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  head_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  head_phone?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentInput extends CreateDepartmentInput {
  id: number;
}

export const departmentsService = {
  /**
   * Get all departments
   */
  async getAll(isActive?: boolean): Promise<Department[]> {
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append("is_active", isActive.toString());
    }
    const response = await apiClient.get(`/departments?${params.toString()}`);
    return response.data;
  },

  /**
   * Get department by ID
   */
  async getById(id: number): Promise<Department> {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },

  /**
   * Create new department
   */
  async create(data: CreateDepartmentInput): Promise<Department> {
    const response = await apiClient.post("/departments", data);
    return response.data;
  },

  /**
   * Update department
   */
  async update(id: number, data: CreateDepartmentInput): Promise<Department> {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data;
  },

  /**
   * Delete department
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },
};
