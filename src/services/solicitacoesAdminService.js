import api from "./api";

export async function listarSolicitacoesAtivas({ page = 0, size = 20, busca = "" } = {}) {
  const { data } = await api.get("/solicitacoes", { params: { page, size, busca } });
  return data;
}

export async function buscarSolicitacao(id) {
  const { data } = await api.get(`/solicitacoes/${id}`);
  return data;
}

export async function encerrarSolicitacao(id, status) {
  const { data } = await api.patch(`/solicitacoes/${id}/status`, { status });
  return data;
}

export function mensagemErroSolicitacao(erro) {
  const status = erro.response?.status;
  if (status === 401) return "Sessão expirada. Entre novamente na Área da equipe.";
  if (status === 403) return "Seu perfil não tem permissão para acessar solicitações.";
  if (status === 404) return "Solicitação não encontrada ou anonimizada. Atualize a lista.";
  if (status === 409) return "Esta solicitação já foi encerrada em outro atendimento. Feche os detalhes e atualize a lista.";
  return erro.response?.data?.erro ?? "Não foi possível acessar as solicitações. Tente novamente.";
}
