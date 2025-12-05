import apiClient from "@/lib/api-client";

export interface AppSetting {
  key: string;
  value: string | null;
  description?: string | null;
  updated_at?: string;
}

export const settingsService = {
  async list(): Promise<AppSetting[]> {
    const res = await apiClient.get("/settings");
    return res.data.data as AppSetting[];
  },
  async get(key: string): Promise<AppSetting> {
    const res = await apiClient.get(`/settings/${encodeURIComponent(key)}`);
    return res.data.data as AppSetting;
  },
  async upsert(key: string, value: string | null, description?: string | null) {
    await apiClient.put(`/settings/${encodeURIComponent(key)}`, {
      value,
      description,
    });
  },
};

export default settingsService;
