import apiClient from "@/lib/api-client";

export interface Student {
  id: number;
  student_code: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  class_id?: number;
  class_name?: string;
  class_code?: string;
  major_id?: number;
  major_name?: string;
  major_code?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  avatar_url?: string;
  status: string; // 'Đang học' | 'Bảo lưu' | 'Nghỉ học' | 'Nghỉ học khi tuyển sinh' | 'Đã tốt nghiệp'
  created_at: string;
  updated_at: string;
}

export interface CreateStudentInput {
  student_code: string;
  full_name: string;
  email?: string; // Optional - will be auto-generated as MSSV@lachong.edu.vn if not provided
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  class_id?: number;
  avatar_url?: string;
  status?: string; // 'Đang học' | 'Bảo lưu' | 'Nghỉ học' | 'Nghỉ học khi tuyển sinh' | 'Đã tốt nghiệp'
}

export interface UpdateStudentInput extends CreateStudentInput {
  id: number;
}

export interface ProfileStatusHistory {
  id: number;
  student_id: number;
  old_status?: string;
  new_status: string;
  changed_by: string;
  changed_by_name?: string;
  changed_by_email?: string;
  changed_at: string;
  notes?: string;
  change_type?: string;
  created_at: string;
}

export interface StatusHistoryResponse {
  history: ProfileStatusHistory[];
  total: number;
  limit: number;
  offset: number;
}

export const studentsService = {
  /**
   * Get all students with optional filters
   */
  async getAll(
    classId?: number,
    majorId?: number,
    departmentId?: number,
    status?: string
  ): Promise<Student[]> {
    const params = new URLSearchParams();
    if (classId !== undefined) params.append("class_id", classId.toString());
    if (majorId !== undefined) params.append("major_id", majorId.toString());
    if (departmentId !== undefined)
      params.append("department_id", departmentId.toString());
    if (status !== undefined) params.append("status", status);

    const response = await apiClient.get(`/students?${params.toString()}`);
    // Server may return either an array (legacy) or a paged object { rows, total, page, pageSize }
    const data = response.data.data;
    if (!data) return [];
    if (Array.isArray(data)) return data as Student[];
    if ((data as any).rows && Array.isArray((data as any).rows))
      return (data as any).rows as Student[];
    return [];
  },

  async getPaged(params: {
    page?: number;
    pageSize?: number;
    q?: string;
    class?: string;
    profile?: "all" | "has" | "no";
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) {
    const response = await apiClient.get(`/students`, { params });
    return response.data.data as {
      rows: Student[];
      total: number;
      page: number;
      pageSize: number;
    };
  },

  async getStats(params?: { class?: string }) {
    const resp = await apiClient.get(`/students/stats`, { params });
    return resp.data.data as { total: number; majors: Array<any> };
  },

  /**
   * Get student by ID
   */
  async getById(id: number): Promise<Student> {
    const response = await apiClient.get(`/students/${id}`);
    return response.data.data;
  },

  /**
   * Create a new student
   */
  async create(data: CreateStudentInput): Promise<Student> {
    const response = await apiClient.post("/students", data);
    return response.data.data;
  },

  /**
   * Update an existing student
   */
  async update(id: number, data: CreateStudentInput): Promise<Student> {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a student
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  },

  /**
   * Get status history for a student
   */
  async getStatusHistory(
    studentId: number,
    limit?: number,
    offset?: number
  ): Promise<StatusHistoryResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());

    const response = await apiClient.get(
      `/students/${studentId}/status-history?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Add status history record manually
   */
  async addStatusHistory(
    studentId: number,
    data: {
      old_status?: string;
      new_status: string;
      notes?: string;
      change_type?: string;
    }
  ): Promise<ProfileStatusHistory> {
    const response = await apiClient.post(
      `/students/${studentId}/status-history`,
      { student_id: studentId, ...data }
    );
    return response.data.data;
  },

  /**
   * Get all status history (admin reporting)
   */
  async getAllStatusHistory(params?: {
    start_date?: string;
    end_date?: string;
    change_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<StatusHistoryResponse> {
    const response = await apiClient.get(`/students/history/all`, { params });
    return response.data.data;
  },
};
