import api from "./api";

export async function listarMadrinhas() {
  const { data } = await api.get("/madrinhas");
  return Array.isArray(data) ? data : [];
}

export async function cadastrarMadrinha(madrinha) {
  const { data } = await api.post("/madrinhas", madrinha);
  return data;
}

export async function listarKits() {
  const { data } = await api.get("/kits");
  return Array.isArray(data) ? data : [];
}

export async function listarPacientes(page = 0, size = 20) {
  const { data } = await api.get("/pacientes", { params: { page, size } });
  return data;
}
