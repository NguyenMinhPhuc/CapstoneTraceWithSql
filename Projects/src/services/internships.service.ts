import apiClient from "@/lib/api-client";

export interface InternshipPosition {
  id: number;
  defense_session_id: number;
  company_id: number;
  title: string;
  description?: string;
  capacity: number;
  manager_user_id?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  company_name?: string;
  company_type?: string;
  manager_name?: string;
}

const internshipsService = {
  async listBySession(sessionId: number) {
    const res = await apiClient.get(
      `/internships/sessions/${sessionId}/positions`
    );
    return res.data.data as InternshipPosition[];
  },

  async getById(id: number) {
    const res = await apiClient.get(`/internships/positions/${id}`);
    return res.data.data as InternshipPosition;
  },

  async create(sessionId: number, payload: Partial<InternshipPosition>) {
    const res = await apiClient.post(
      `/internships/sessions/${sessionId}/positions`,
      payload
    );
    return res.data.data as InternshipPosition;
  },

  async update(id: number, payload: Partial<InternshipPosition>) {
    const res = await apiClient.put(`/internships/positions/${id}`, payload);
    return res.data.data as InternshipPosition;
  },

  async remove(id: number) {
    const res = await apiClient.delete(`/internships/positions/${id}`);
    return res.data;
  },
};

export default internshipsService;
