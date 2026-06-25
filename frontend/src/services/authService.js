import api from "./api";

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  registerEmpresa: (data) => api.post("/auth/register-empresa", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  recuperarPassword: (email) => api.post("/auth/recuperar-password", { email }),
  restablecerPassword: (data) => api.post("/auth/restablecer-password", data),
};
