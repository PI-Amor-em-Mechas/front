import axios from "axios";

// Uma única instância do Axios para o projeto inteiro.
// Se o endereço do backend mudar, você altera só aqui (ou no arquivo .env).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 15000,
});

export default api;
