import apiClient from "@/lib/api-client";

export interface Company {
  id: number;
  external_id?: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  manager_name?: string;
  manager_phone?: string;
  company_type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyInput {
  external_id?: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  manager_name?: string;
  manager_phone?: string;
  company_type?: string;
  is_active?: boolean;
}

export const companiesService = {
  async getAll(
    params?: { company_type?: string; q?: string } | { is_active?: boolean }
  ): Promise<Company[]> {
    const resp = await apiClient.get("/companies", { params });
    return resp.data.data || [];
  },

  async getById(id: number): Promise<Company> {
    const resp = await apiClient.get(`/companies/${id}`);
    return resp.data.data;
  },

  async create(data: CreateCompanyInput): Promise<Company> {
    const resp = await apiClient.post(`/companies`, data);
    return resp.data.data;
  },

  async update(
    id: number,
    data: Partial<CreateCompanyInput>
  ): Promise<Company> {
    const resp = await apiClient.put(`/companies/${id}`, data);
    return resp.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  },
};

export default companiesService;
