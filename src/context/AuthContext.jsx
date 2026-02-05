import { createContext, useContext, useEffect, useState } from "react";
import api, { setupAxiosInterceptors } from "@/utils/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Setup axios once globally
  useEffect(() => {
    setupAxiosInterceptors();
    initAuth();
  }, []);

  // ---------------- INIT SESSION ----------------
  const initAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/v1/auth/me");
      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- LOGIN ----------------
  const login = async (email, password, navigate) => {
    try {
      console.log("🔐 Attempting login for:", email);

      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      console.log("🧾 Raw login response:", response.data);

      // ✅ SUPPORT BOTH BACKEND FORMATS SAFELY
      const payload = response.data.data || response.data;

      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid login response structure");
      }

      const { user, token, redirectTo } = payload;

      console.log("✅ Login success:", user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      if (navigate) {
        navigate(redirectTo || "/home");
      }

      return { success: true, user };
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);

      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Login failed",
      };
    }
  };


  // ---------------- REGISTER ----------------
  const register = async (formData) => {
    try {
      const res = await api.post("/api/v1/auth/register", formData);

      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      navigate("/select-role");

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Registration failed",
      };
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (_) { }

    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  // ---------------- SET ROLE ----------------
  const setUserRole = async (role) => {
    try {
      console.log("🎭 Setting user role selection:", role);

      // Map 'listener' to 'user' for backend compatibility
      const targetRole = role === 'listener' ? 'user' : role;

      if (role !== targetRole) {
        console.log(`🔄 Mapping role "${role}" to "${targetRole}" for backend`);
      }

      const res = await api.put("/api/v1/auth/set-role", { role: targetRole });

      console.log("✅ Role update response:", res.data);

      const updatedUser = res.data.data || res.data.user;

      if (!updatedUser) {
        throw new Error("Invalid response from set-role");
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (targetRole === "artist") {
        navigate("/artist/dashboard");
      } else {
        navigate("/home");
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Role update failed:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.error || "Role update failed",
      };
    }
  };

  // ---------------- HELPERS ----------------
  const hasRole = (roles) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  const isAdmin = () => user?.role === "admin";
  const isArtist = () => ["artist", "admin"].includes(user?.role);
  const needsRoleSelection = () => isAuthenticated && !user?.role;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setUserRole,
    hasRole,
    isAdmin,
    isArtist,
    needsRoleSelection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
