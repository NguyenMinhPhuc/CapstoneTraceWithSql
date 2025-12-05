import apiClient from "@/lib/api-client";

export interface ResourceLink {
  id: number;
  resource_id: number;
  label: string;
  url: string;
  order_index: number;
  created_at: string;
}

export interface Resource {
  id: number;
  name: string;
  summary?: string;
  category: string;
  resource_type?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  links_count?: number;
  links?: ResourceLink[];
}

export interface ResourcesResponse {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const resourcesService = {
  async listResources(
    params: {
      page?: number;
      pageSize?: number;
      category?: string;
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<ResourcesResponse> {
    const queryParams: any = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
    if (params.category) queryParams.category = params.category;
    if (params.search) queryParams.search = params.search;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;

    const response = await apiClient.get("/resources", { params: queryParams });
    return response.data.data;
  },

  async getResource(id: number): Promise<Resource> {
    const response = await apiClient.get(`/resources/${id}`);
    return response.data.data;
  },

  async createResource(data: {
    name: string;
    summary?: string;
    category: string;
    resource_type?: string;
    is_active?: boolean;
  }): Promise<{ id: number }> {
    const response = await apiClient.post("/resources", data);
    return response.data.data;
  },

  async updateResource(
    id: number,
    data: {
      name: string;
      summary?: string;
      category: string;
      resource_type?: string;
      is_active: boolean;
    }
  ): Promise<void> {
    await apiClient.put(`/resources/${id}`, data);
  },

  async deleteResource(id: number): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  },

  async addResourceLink(
    resourceId: number,
    data: {
      label: string;
      url: string;
      order_index?: number;
    }
  ): Promise<{ id: number }> {
    const response = await apiClient.post(
      `/resources/${resourceId}/links`,
      data
    );
    return response.data.data;
  },

  async updateResourceLink(
    resourceId: number,
    linkId: number,
    data: {
      label: string;
      url: string;
      order_index: number;
    }
  ): Promise<void> {
    await apiClient.put(`/resources/${resourceId}/links/${linkId}`, data);
  },

  async deleteResourceLink(resourceId: number, linkId: number): Promise<void> {
    await apiClient.delete(`/resources/${resourceId}/links/${linkId}`);
  },
};

export default resourcesService;
