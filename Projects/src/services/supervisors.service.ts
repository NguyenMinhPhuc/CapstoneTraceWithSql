import apiClient from "@/lib/api-client";

export interface Supervisor {
  id: string;
  user_id: string;
  department: number;
  title: string;
  max_students: number;
  current_students: number;
  specializations?: string;
  lecturer_type?: string;
  created_at: string;
  updated_at: string;
  // From users table
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
}

export interface CreateSupervisorInput {
  email: string;
  full_name: string;
  phone?: string;
  department: number;
  title: string;
  max_students?: number;
  specializations?: string;
  lecturer_type?: string;
  avatar_url?: string;
}

export interface UpdateSupervisorInput extends Partial<CreateSupervisorInput> {
  id: string;
}

export const supervisorsService = {
  /**
   * Get all supervisors
   */
  async getAll(filters?: {
    department?: number;
    lecturer_type?: string;
    title?: string;
  }): Promise<Supervisor[]> {
    const params: any = {};
    if (filters) {
      if (filters.department !== undefined && filters.department !== null)
        params.department = filters.department;
      if (filters.lecturer_type) params.lecturer_type = filters.lecturer_type;
      if (filters.title) params.title = filters.title;
    }

    const response = await apiClient.get("/supervisors", { params });
    return response.data.data || [];
  },

  /**
   * Get supervisor by ID
   */
  async getById(id: string): Promise<Supervisor> {
    const response = await apiClient.get(`/supervisors/${id}`);
    return response.data.data;
  },

  /**
   * Create a new supervisor
   */
  async create(data: CreateSupervisorInput): Promise<Supervisor> {
    const response = await apiClient.post("/supervisors", data);
    return response.data.data;
  },

  /**
   * Update an existing supervisor
   */
  async update(
    id: string,
    data: Partial<CreateSupervisorInput>
  ): Promise<Supervisor> {
    const response = await apiClient.put(`/supervisors/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a supervisor
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/supervisors/${id}`);
  },
};
