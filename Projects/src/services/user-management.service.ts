import apiClient from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "supervisor" | "student" | "council_member" | "manager";
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Student data
  student_id?: string;
  student_code?: string;
  class_id?: number;
  major_id?: number;
  gpa?: number;
  class_name?: string;
  major_name?: string;
  // Supervisor data
  supervisor_id?: string;
  department?: string;
  title?: string;
  max_students?: number;
  current_students?: number;
  specializations?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export const userManagementService = {
  /**
   * Create new user (admin only)
   */
  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
  }): Promise<void> {
    await apiClient.post("/user-management", data);
  },

  /**
   * Get paginated list of users
   */
  async listUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    role?: string,
    isActive?: boolean
  ): Promise<UserListResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (isActive !== undefined) params.append("isActive", isActive.toString());

    const response = await apiClient.get(
      `/user-management?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string): Promise<User> {
    const response = await apiClient.get(`/user-management/${userId}`);
    return response.data.data;
  },

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    data: {
      fullName: string;
      phone?: string;
      avatarUrl?: string;
      isActive?: boolean;
    }
  ): Promise<void> {
    await apiClient.put(`/user-management/${userId}`, data);
  },

  /**
   * Update student information
   */
  async updateStudentInfo(
    studentId: string,
    data: {
      classId?: number;
      majorId?: number;
      gpa?: number;
      status?: string;
    }
  ): Promise<void> {
    await apiClient.put(`/user-management/student/${studentId}`, data);
  },

  /**
   * Update supervisor information
   */
  async updateSupervisorInfo(
    supervisorId: string,
    data: {
      department?: string;
      title?: string;
      maxStudents?: number;
      specializations?: string;
    }
  ): Promise<void> {
    await apiClient.put(`/user-management/supervisor/${supervisorId}`, data);
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/user-management/${userId}`);
  },

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    await apiClient.post(`/user-management/${userId}/activate`);
  },

  /**
   * Reset user password
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await apiClient.post(`/user-management/${userId}/reset-password`, {
      newPassword,
    });
  },
};
