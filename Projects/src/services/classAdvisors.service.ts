import apiClient from "@/lib/api-client";

export interface ClassAdvisor {
  id: number;
  class_id: number;
  class_name?: string;
  class_code?: string;
  major_id?: number;
  major_name?: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_email?: string;
  teacher_phone?: string;
  teacher_type: string;
  semester: string;
  academic_year: string;
  assigned_date: string;
  assigned_by?: string;
  assigned_by_name?: string;
  is_active: boolean;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student_count?: number;
  profile_count?: number;
  days_served?: number;
}

export interface CreateClassAdvisorInput {
  class_id: number;
  teacher_id: string;
  teacher_type?: string;
  semester: string;
  academic_year: string;
  notes?: string;
}

export interface UpdateClassAdvisorInput {
  notes?: string;
  is_active?: boolean;
}

export interface AdvisorProfile {
  id: number;
  advisor_id: number;
  class_id?: number;
  class_name?: string;
  class_code?: string;
  semester?: string;
  academic_year?: string;
  teacher_id?: string;
  teacher_name?: string;
  profile_type: string;
  title?: string;
  content?: string;
  profile_data?: string; // JSON string
  attachments?: string; // JSON array of URLs
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvisorProfileInput {
  advisor_id: number;
  profile_type?: string;
  title?: string;
  content?: string;
  profile_data?: any; // Will be stringified
  attachments?: string[];
}

export const classAdvisorsService = {
  /**
   * Assign class advisor
   */
  async assign(data: CreateClassAdvisorInput): Promise<ClassAdvisor> {
    const response = await apiClient.post("/class-advisors", data);
    return response.data.data;
  },

  /**
   * Get all class advisors with filters
   */
  async getAll(params?: {
    class_id?: number;
    teacher_id?: string;
    semester?: string;
    academic_year?: string;
    is_active?: boolean;
  }): Promise<ClassAdvisor[]> {
    const response = await apiClient.get("/class-advisors", { params });
    return response.data.data;
  },

  /**
   * Get advisor assignment history for a class
   */
  async getHistory(classId: number): Promise<ClassAdvisor[]> {
    const response = await apiClient.get(`/class-advisors/history/${classId}`);
    return response.data.data;
  },

  /**
   * Update class advisor
   */
  async update(id: number, data: UpdateClassAdvisorInput): Promise<void> {
    await apiClient.put(`/class-advisors/${id}`, data);
  },

  /**
   * Delete class advisor assignment
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/class-advisors/${id}`);
  },

  /**
   * Add advisor profile entry
   */
  async addProfile(data: CreateAdvisorProfileInput): Promise<AdvisorProfile> {
    // Stringify profile_data and attachments if they're objects
    const payload = {
      ...data,
      profile_data:
        typeof data.profile_data === "object"
          ? JSON.stringify(data.profile_data)
          : data.profile_data,
      attachments: Array.isArray(data.attachments)
        ? JSON.stringify(data.attachments)
        : data.attachments,
    };

    const response = await apiClient.post("/class-advisors/profiles", payload);
    return response.data.data;
  },

  /**
   * Get advisor profiles
   */
  async getProfiles(params?: {
    advisor_id?: number;
    class_id?: number;
    profile_type?: string;
  }): Promise<AdvisorProfile[]> {
    const response = await apiClient.get("/class-advisors/profiles", {
      params,
    });
    return response.data.data;
  },
};
