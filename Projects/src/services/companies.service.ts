import apiClient from "@/lib/api-client";

export interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
}

export const companiesService = {
  async getAll(filters?: { is_active?: boolean }): Promise<Company[]> {
    const params: any = {};
    if (filters && filters.is_active !== undefined)
      params.is_active = filters.is_active;
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
