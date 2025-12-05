"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import authService, {
  User,
  LoginData,
  RegisterData,
} from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          console.log("Loading user from localStorage:", currentUser);
          if (currentUser) {
            setUser(currentUser);
            // Optionally refresh from server
            try {
              const freshUser = await authService.getProfile();
              console.log("Refreshed user from server:", freshUser);
              if (freshUser) {
                setUser(freshUser);
              } else {
                console.warn(
                  "Profile endpoint returned undefined, keeping cached user"
                );
              }
            } catch (error) {
              console.error("Failed to refresh user profile:", error);
              // Keep the cached user if refresh fails
            }
          } else {
            console.log("No user found in localStorage despite having token");
          }
        } else {
          console.log("User not authenticated (no token)");
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const authData = await authService.login(data);
      console.log("Login successful, user data:", authData.user);
      console.log(
        "Token saved:",
        localStorage.getItem("accessToken") ? "Yes" : "No"
      );
      console.log("User saved:", localStorage.getItem("user") ? "Yes" : "No");
      setUser(authData.user);
      // Don't redirect here - let the caller handle it
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const authData = await authService.register(data);
      setUser(authData.user);
      router.push("/"); // Redirect to home after registration
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user even if API call fails
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getProfile();
      setUser(freshUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
