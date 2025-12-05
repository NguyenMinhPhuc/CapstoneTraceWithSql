import apiClient from "@/lib/api-client";

export interface Class {
  id: number;
  code: string;
  name: string;
  major_id?: number;
  major_name?: string;
  major_code?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  academic_year?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  student_count?: number;
}

export interface CreateClassInput {
  code: string;
  name: string;
  major_id?: number;
  academic_year?: string;
  is_active?: boolean;
}

export interface UpdateClassInput extends CreateClassInput {
  id: number;
}

export const classesService = {
  /**
   * Get all classes
   */
  async getAll(
    majorId?: number,
    academicYear?: string,
    isActive?: boolean
  ): Promise<Class[]> {
    const params = new URLSearchParams();
    if (majorId !== undefined) {
      params.append("major_id", majorId.toString());
    }
    if (academicYear) {
      params.append("academic_year", academicYear);
    }
    if (isActive !== undefined) {
      params.append("is_active", isActive.toString());
    }
    const response = await apiClient.get(`/classes?${params.toString()}`);
    return response.data;
  },

  /**
   * Get class by ID
   */
  async getById(id: number): Promise<Class> {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  },

  /**
   * Create new class
   */
  async create(data: CreateClassInput): Promise<Class> {
    const response = await apiClient.post("/classes", data);
    return response.data;
  },

  /**
   * Update class
   */
  async update(id: number, data: CreateClassInput): Promise<Class> {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Delete class
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },
};
