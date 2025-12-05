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
    return response.data.data || [];
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
};
