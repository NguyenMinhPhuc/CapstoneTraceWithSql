import apiClient from "@/lib/api-client";

export interface MyProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  student_id?: string;
  student_code?: string;
  class_id?: number;
  class_name?: string;
  major_id?: number;
  major_name?: string;
  supervisor_id?: string;
  department?: string;
  title?: string;
}

export const profileService = {
  async get(): Promise<MyProfile> {
    const res = await apiClient.get("/profile");
    return res.data.data as MyProfile;
  },
  async update(data: {
    fullName: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<void> {
    await apiClient.put("/profile", data);
  },
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    // Remove Content-Type to let browser set multipart boundary
    const res = await apiClient.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return res.data.data.avatarUrl as string;
  },
};
