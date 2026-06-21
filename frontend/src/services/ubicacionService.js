import api from "./api";

export const ubicacionService = {
  enviar: (data) => api.post("/ubicaciones", data),
  getUltima: (repartidorId) =>
    api.get("/ubicaciones", { params: { repartidor_id: repartidorId } }),
  getTodas: () => api.get("/ubicaciones"),
  getMapa: () => api.get("/ubicaciones/mapa"),
};
