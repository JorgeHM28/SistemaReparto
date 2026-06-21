import api from "./api";

export const dashboardService = {
  admin: () => api.get("/dashboard/admin"),
  cliente: () => api.get("/dashboard/cliente"),
  repartidor: () => api.get("/dashboard/repartidor"),
  reportes: () => api.get("/reportes"),
};
