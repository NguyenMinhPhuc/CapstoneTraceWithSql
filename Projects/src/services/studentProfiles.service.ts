import apiClient from "@/lib/api-client";

export interface StudentProfile {
  id: number;
  student_id: number;
  contact_info?: string;
  guardian_info?: string;
  residency_type?: string;
  residency_details?: string;
  residence_address?: string;
  family_circumstances?: string;
  awards?: string;
  disciplinary?: string;
  activities?: string;
  health_status?: string;
  academic_advisor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const studentProfilesService = {
  async getByStudentId(
    studentId: string | number
  ): Promise<StudentProfile | null> {
    const resp = await apiClient.get(`/student-profiles/student/${studentId}`);
    return resp.data.data || null;
  },

  async create(data: Partial<StudentProfile>) {
    const resp = await apiClient.post(`/student-profiles`, data);
    return resp.data.data;
  },

  async update(id: string | number, data: Partial<StudentProfile>) {
    const resp = await apiClient.put(`/student-profiles/${id}`, data);
    return resp.data.data;
  },

  async delete(id: string | number) {
    await apiClient.delete(`/student-profiles/${id}`);
  },
};

export default studentProfilesService;
