import api, { limparSessao, obterAccessToken, salvarSessao } from "./api";

export async function entrar(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  salvarSessao(data);
  return data;
}

export async function entrarComoDemonstracao() {
  if (!import.meta.env.DEV) {
    throw new Error("O acesso de demonstração está disponível somente em desenvolvimento.");
  }

  const { data } = await api.post("/auth/dev-token", {
    username: "demo.atendente",
    role: "ROLE_ATENDENTE",
  });
  salvarSessao(data);
  return data;
}

export function estaAutenticado() {
  return Boolean(obterAccessToken());
}

export function sair() {
  limparSessao();
}
