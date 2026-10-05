import axios from "axios";

const ACCESS_TOKEN_KEY = "amor-em-mechas.accessToken";
const REFRESH_TOKEN_KEY = "amor-em-mechas.refreshToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15000,
});

export function salvarSessao({ accessToken, refreshToken }) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function obterAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function limparSessao() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const accessToken = obterAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshEmAndamento;

api.interceptors.response.use(
  (response) => response,
  async (erro) => {
    const config = erro.config;
    const url = config?.url ?? "";
    const endpointDeAuth = ["/auth/login", "/auth/refresh", "/auth/dev-token"]
      .some((endpoint) => url.includes(endpoint));

    if (erro.response?.status !== 401 || !config || config._retry || endpointDeAuth) {
      throw erro;
    }

    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      if (obterAccessToken()) {
        limparSessao();
        window.dispatchEvent(new Event("auth-expired"));
      }
      throw erro;
    }

    config._retry = true;
    try {
      refreshEmAndamento ??= api.post("/auth/refresh", { refreshToken })
        .then(({ data }) => {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          return data.accessToken;
        })
        .finally(() => { refreshEmAndamento = null; });

      const accessToken = await refreshEmAndamento;
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch (error_) {
      limparSessao();
      window.dispatchEvent(new Event("auth-expired"));
      throw error_;
    }
  },
);

export default api;
