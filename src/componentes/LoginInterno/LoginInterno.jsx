import { useState } from "react";
import { entrar, entrarComoDemonstracao } from "../../services/authService";
import "./LoginInterno.css";

function LoginInterno({ aoEntrar }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(username, password);
      aoEntrar();
    } catch (error_) {
      setErro(error_.response?.data?.mensagem ?? "Não foi possível entrar. Confira usuário e senha.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrarDemo() {
    setErro("");
    setEnviando(true);
    try {
      await entrarComoDemonstracao();
      aoEntrar();
    } catch (error_) {
      setErro(error_.response?.data?.mensagem ?? "Não foi possível iniciar a sessão de demonstração.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="loginInterno">
      <form className="loginPainel" onSubmit={enviar}>
        <h1>Área da equipe</h1>
        <p>Entre com sua conta para acessar os painéis internos.</p>
        <label>
          <span>Usuário</span>
          <input autoComplete="username" required value={username} onChange={(evento) => setUsername(evento.target.value)} />
        </label>
        <label>
          <span>Senha</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(evento) => setPassword(evento.target.value)} />
        </label>
        {erro && <p className="loginErro" role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? "Entrando..." : "Entrar"}</button>
        {import.meta.env.DEV && <button className="botaoDemo" type="button" onClick={entrarDemo} disabled={enviando}>
          Entrar como demo.atendente
        </button>}
      </form>
    </main>
  );
}

export default LoginInterno;
