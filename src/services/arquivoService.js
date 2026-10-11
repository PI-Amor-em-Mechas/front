import api from "./api";
import { podeRevisarDocumentos } from "./authService";
import { validarArquivo } from "./arquivoValidation";

export function mensagemErroArquivo(erro) {
  if (erro.response?.status === 401) return "Sessão expirada. Entre novamente para continuar.";
  if (erro.response?.status === 403) return "Acesso restrito. Você não tem permissão para acessar este documento.";
  if (erro.response?.status === 409) return "O laudo ainda não foi aprovado. Aguarde a validação da equipe.";
  return erro.response?.data?.erro ?? erro.response?.data?.mensagem ?? erro.message ?? "Não foi possível processar o documento.";
}

export async function enviarArquivo(arquivo, tipo, pacienteId) {
  if (pacienteId != null && !podeRevisarDocumentos()) throw new Error("A associação do documento ao paciente exige acesso da equipe de revisão.");
  const seguro = await validarArquivo(arquivo);
  const corpo = new FormData();
  corpo.append("arquivo", seguro);
  corpo.append("tipo", tipo);
  if (pacienteId != null) corpo.append("pacienteId", String(pacienteId));
  const { data } = await api.post("/arquivos", corpo);
  return data;
}

export async function buscarArquivo(id, signal) {
  const { data } = await api.get(`/arquivos/${encodeURIComponent(id)}`, { signal });
  return data;
}

export async function listarPendentes() {
  if (!podeRevisarDocumentos()) throw new Error("Acesso restrito à equipe de revisão.");
  const { data } = await api.get("/arquivos/pendentes-validacao");
  return Array.isArray(data) ? data : data.content ?? [];
}

export async function revisarArquivo(id, decisao, observacao) {
  if (!podeRevisarDocumentos()) throw new Error("Acesso restrito à equipe de revisão.");
  if (!["APROVADO", "REJEITADO"].includes(decisao)) throw new Error("Decisão inválida.");
  if (decisao === "REJEITADO" && !observacao.trim()) throw new Error("Informe a observação da rejeição.");
  const { data } = await api.patch(`/arquivos/${encodeURIComponent(id)}/validacao`, {
    decisao, observacao: observacao.trim(),
  });
  return data;
}

export async function obterConteudoArquivo(id) {
  const documento = await buscarArquivo(id);
  if (documento.statusValidacao !== "APROVADO" && !podeRevisarDocumentos()) {
    throw new Error("Acesso restrito. O documento ainda não foi aprovado.");
  }
  const { data } = await api.get(`/arquivos/${encodeURIComponent(id)}/download`, { responseType: "blob" });
  return { documento, conteudo: data };
}

export async function reprocessarComparacao(id) {
  if (!podeRevisarDocumentos()) throw new Error("Acesso restrito à equipe de revisão.");
  const { data } = await api.post(`/arquivos/${encodeURIComponent(id)}/comparacao/reprocessar`);
  return data;
}