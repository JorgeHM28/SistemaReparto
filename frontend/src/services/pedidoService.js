import api from "./api";

export const pedidoService = {
  getAll: (params = {}) => api.get("/pedidos", { params }),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post("/pedidos", data),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
  delete: (id) => api.delete(`/pedidos/${id}`),
};

export const ESTADOS_PEDIDO = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "asignado", label: "Asignado" },
  { value: "en_ruta", label: "En ruta" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export const ESTADO_LABELS = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  en_ruta: "En ruta",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
