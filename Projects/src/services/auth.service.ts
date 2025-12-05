import apiClient, { handleApiError } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "supervisor" | "student" | "council_member";
  studentCode?: string;
  supervisorCode?: string;
  phone?: string;
  address?: string;
  major?: string;
  className?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: "student" | "supervisor" | "council_member";
  studentCode?: string;
  supervisorCode?: string;
  phone?: string;
  address?: string;
  major?: string;
  className?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>(
        "/auth/register",
        data
      );
      const authData = response.data.data;

      // Save tokens and user to localStorage
      localStorage.setItem("accessToken", authData.token);
      localStorage.setItem("refreshToken", authData.refreshToken);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ data: AuthResponse }>(
        "/auth/login",
        data
      );
      const authData = response.data.data;

      // Save tokens and user to localStorage
      localStorage.setItem("accessToken", authData.token);
      localStorage.setItem("refreshToken", authData.refreshToken);
      localStorage.setItem("user", JSON.stringify(authData.user));

      return authData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<{ data: { user: User } }>(
        "/auth/profile"
      );
      const user = response.data.data.user;

      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.put("/auth/change-password", data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
export default authService;
