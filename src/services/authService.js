import api, { limparSessao, obterAccessToken, salvarSessao } from "./api";

export async function entrar(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  salvarSessao(data);
  return data;
}

export async function entrarComoDemonstracao(perfil = "atendente") {
  if (!import.meta.env.DEV) {
    throw new Error("O acesso de demonstração está disponível somente em desenvolvimento.");
  }

  if (!["atendente", "admin"].includes(perfil)) {
    throw new Error("Perfil de demonstração inválido.");
  }
  const { data } = await api.post("/auth/dev-token", {
    username: perfil === "admin" ? "admin.dev" : "demo.atendente",
    role: perfil === "admin" ? "ROLE_ADMIN" : "ROLE_ATENDENTE",
  });
  salvarSessao(data);
  return data;
}

export function estaAutenticado() {
  return Boolean(obterAccessToken());
}

export function podeRevisarDocumentos() {
  try {
    const payload = obterAccessToken()?.split(".")[1];
    if (!payload) return false;
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return Number.isFinite(claims.exp) && claims.exp * 1000 > Date.now() &&
      ["ROLE_ADMIN", "ROLE_MEDICO", "ROLE_ENFERMEIRO", "ADMIN", "MEDICO", "ENFERMEIRO"].includes(claims.role);
  } catch {
    return false;
  }
}

export function sair() {
  limparSessao();
}
