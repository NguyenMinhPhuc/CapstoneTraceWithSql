import apiClient from "@/lib/api-client";

export interface Rubric {
  id: number;
  name: string;
  rubric_type: string;
  description?: string;
  total_score: number;
  is_active: boolean;
}

export interface DefenseSession {
  id: number;
  name: string;
  session_type: string;
  start_date?: string | null;
  registration_deadline?: string | null;
  submission_deadline?: string | null;
  expected_date?: string | null;
  description?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  session_type_name?: string;
  linh_group?: string | null;
  council_score_ratio?: number | null;
  supervisor_score_ratio?: number | null;
  submission_folder_link?: string | null;
  submission_description?: string | null;
  council_rubric_id?: number | null;
  supervisor_rubric_id?: number | null;
}

export interface CreateDefenseInput {
  name: string;
  session_type: string;
  start_date?: string | null;
  registration_deadline?: string | null;
  submission_deadline?: string | null;
  expected_date?: string | null;
  description?: string | null;
  status?: string;
  linh_group?: string | null;
  council_score_ratio?: number | null;
  supervisor_score_ratio?: number | null;
  submission_folder_link?: string | null;
  submission_description?: string | null;
  council_rubric_id?: number | null;
  supervisor_rubric_id?: number | null;
}

export interface UpdateDefenseInput extends Partial<CreateDefenseInput> {
  id: number;
}

export const defenseService = {
  async getSessionTypes() {
    const res = await apiClient.get("/defense/session-types");
    return res.data.data as SessionType[];
  },

  async getRubrics(type?: string) {
    const params: any = {};
    if (type) params.type = type;
    const res = await apiClient.get("/defense/rubrics", { params });
    return res.data.data as Rubric[];
  },

  async getAll(filters?: { session_type?: string; status?: string }) {
    const params: any = {};
    if (filters) {
      if (filters.session_type) params.session_type = filters.session_type;
      if (filters.status) params.status = filters.status;
    }

    const res = await apiClient.get("/defense/sessions", { params });
    return res.data.data as DefenseSession[];
  },

  async getById(id: number) {
    const res = await apiClient.get(`/defense/sessions/${id}`);
    return res.data.data as DefenseSession;
  },

  async create(payload: CreateDefenseInput) {
    const res = await apiClient.post(`/defense/sessions`, payload);
    return res.data.data as DefenseSession;
  },

  async update(id: number, payload: Partial<CreateDefenseInput>) {
    const res = await apiClient.put(`/defense/sessions/${id}`, payload);
    return res.data.data as DefenseSession;
  },

  async delete(id: number) {
    await apiClient.delete(`/defense/sessions/${id}`);
  },

  async getRegistrations(sessionId: string) {
    const res = await apiClient.get(
      `/defense/sessions/${sessionId}/registrations`
    );
    return res.data.data;
  },

  async createRegistration(
    sessionId: string,
    payload: {
      student_id: number;
      student_code?: string | null;
      student_name?: string | null;
      class_name?: string | null;
      report_status?: string | null;
      report_status_note?: string | null;
    }
  ) {
    const res = await apiClient.post(
      `/defense/sessions/${sessionId}/registrations`,
      payload
    );
    return res.data.data;
  },

  async deleteRegistration(id: number) {
    const res = await apiClient.delete(`/defense/registrations/${id}`);
    return res.data.data;
  },
  async updateRegistration(
    id: number,
    payload: {
      report_status?: string | null;
      report_status_note?: string | null;
    }
  ) {
    const res = await apiClient.put(`/defense/registrations/${id}`, payload);
    return res.data.data;
  },
};
