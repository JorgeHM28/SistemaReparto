import api from "./api";

export const usuarioService = {
  getAll: (params = {}) => api.get("/usuarios", { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post("/usuarios", data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};
