import api from "./api";

export const rutaService = {
  getAll: (params = {}) => api.get("/rutas", { params }),
  getDisponibles: () => api.get("/rutas/disponibles"),
  getActiva: () => api.get("/rutas/activa"),
  getById: (id) => api.get(`/rutas/${id}`),
  create: (data) => api.post("/rutas", data),
  update: (id, data) => api.put(`/rutas/${id}`, data),
  optimizar: (id, data = {}) => api.post(`/rutas/${id}/optimizar`, data),
  delete: (id) => api.delete(`/rutas/${id}`),
};

export const ESTADO_RUTA_LABELS = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  finalizada: "Finalizada",
};
