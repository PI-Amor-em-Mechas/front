import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import { listarPacientes } from "../../services/dashboardService";
import "../DashboardMadrinhas/DashboardMadrinhas.css";
import "../Tabela/Tabela.css";
import "./DashboardPacientes.css";

const TAMANHO_PAGINA = 20;

function DashboardPacientes({ irParaFormulario, irParaMadrinhas, irParaEnvios, sair }) {
    const [pagina, setPagina] = useState(0);
    const [resultado, setResultado] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarPacientes(pagina, TAMANHO_PAGINA)
            .then((dados) => {
                if (ativo) setResultado({
                    content: dados.content ?? [],
                    totalPages: dados.totalPages ?? 0,
                    totalElements: dados.totalElements ?? 0,
                });
            })
            .catch((error_) => {
                if (ativo) setErro(error_.response?.data?.mensagem ?? "Não foi possível carregar os pacientes.");
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [pagina]);

    const pacientes = resultado.content.filter((paciente) => (
        `${paciente.id} ${paciente.nomeCompleto ?? ""} ${paciente.email ?? ""}`.toLowerCase().includes(busca.trim().toLowerCase())
    ));

    function mudarPagina(proxima) {
        setCarregando(true);
        setErro("");
        setPagina(proxima);
    }

    return (
        <div className="app">
            <Navbar
                irParaFormulario={irParaFormulario}
                irParaMadrinhas={irParaMadrinhas}
                irParaEnvios={irParaEnvios}
                pagina="pacientes"
                sair={sair}
            />
            <main className="conteudo">
                <Header titulo="Pacientes" descricao="Solicitações registradas no sistema" mostrarBotao={false} />
                <section className="resumoPacientes">
                    <strong>{resultado.totalElements} pacientes</strong>
                    <input
                        type="search"
                        placeholder="Buscar nesta página por nome, e-mail ou ID"
                        value={busca}
                        onChange={(evento) => setBusca(evento.target.value)}
                    />
                </section>
                {erro && <p role="alert">{erro}</p>}
                <div className="containerTabela">
                    <div className="tabela">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Paciente</th>
                                    <th>Data da solicitação</th>
                                    <th>Tratamento</th>
                                    <th>Localidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.map((paciente) => (
                                    <tr key={paciente.id}>
                                        <td>#{paciente.id}</td>
                                        <td><strong>{paciente.nomeCompleto ?? "Sem nome"}</strong><br /><span>{paciente.email ?? "-"}</span></td>
                                        <td>{paciente.dtPedido ? new Date(`${paciente.dtPedido}T00:00:00`).toLocaleDateString("pt-BR") : "-"}</td>
                                        <td>{paciente.dadosMedicos?.tipoCancer ?? paciente.dadosMedicos?.motivo ?? "-"}</td>
                                        <td>{[paciente.endereco?.cidade, paciente.endereco?.estado].filter(Boolean).join(" / ") || "-"}</td>
                                    </tr>
                                ))}
                                {!carregando && pacientes.length === 0 && <tr><td colSpan="5">Nenhum paciente encontrado.</td></tr>}
                            </tbody>
                        </table>
                        {carregando && <p className="estadoTabela">Carregando pacientes...</p>}
                    </div>
                </div>
                <div className="paginacaoPacientes">
                    <button type="button" disabled={pagina === 0 || carregando} onClick={() => mudarPagina(pagina - 1)}>Anterior</button>
                    <span>Página {resultado.totalPages === 0 ? 0 : pagina + 1} de {resultado.totalPages}</span>
                    <button type="button" disabled={carregando || pagina + 1 >= resultado.totalPages} onClick={() => mudarPagina(pagina + 1)}>Próxima</button>
                </div>
            </main>
        </div>
    );
}

export default DashboardPacientes;
