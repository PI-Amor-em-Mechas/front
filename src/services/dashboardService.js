import api from "./api";

export async function listarMadrinhas() {
  const { data } = await api.get("/madrinhas");
  return Array.isArray(data) ? data : [];
}

export async function cadastrarMadrinha(madrinha) {
  const { data } = await api.post("/madrinhas", madrinha);
  return data;
}

export async function atualizarMadrinha(id, madrinha) {
  const { data } = await api.put(`/madrinhas/${id}`, madrinha);
  return data;
}

export async function removerMadrinha(id) {
  await api.delete(`/madrinhas/${id}`);
}

export async function listarKits() {
  const { data } = await api.get("/kits");
  return Array.isArray(data) ? data : [];
}

export async function listarPacientes(page = 0, size = 20) {
  const { data } = await api.get("/pacientes", { params: { page, size } });
  return data;
}

export async function listarTodosPacientes(size = 100) {
  const primeiraPagina = await listarPacientes(0, size);
  const totalPaginas = primeiraPagina.totalPages ?? 1;
  const paginasRestantes = await Promise.all(
    Array.from({ length: Math.max(0, totalPaginas - 1) }, (_, indice) =>
      listarPacientes(indice + 1, size),
    ),
  );

  return [primeiraPagina, ...paginasRestantes]
    .flatMap((pagina) => pagina.content ?? []);
}