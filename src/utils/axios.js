import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

let interceptorInitialized = false;

export const setupAxiosInterceptors = () => {
  if (interceptorInitialized) return;

  // Attach token on every request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Global 401 handler
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("🔐 Session expired. Clearing auth state.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return Promise.reject(error);
    }
  );

  interceptorInitialized = true;
};

export default api;
