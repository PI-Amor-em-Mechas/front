import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import RankingRegioes from "../RankingRegioes/RankingRegioes";
import { listarKits, listarTodosPacientes } from "../../services/dashboardService";
import "../DashboardMadrinhas/DashboardMadrinhas.css";
import "./DashboardEnvios.css";

function normalizarStatus(status) {
    return String(status ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[_\s]+/g, "-");
}

function formatarData(data) {
    if (!data) return "-";
    const valor = String(data);
    const dataLocal = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
    return Number.isNaN(dataLocal.getTime()) ? valor : dataLocal.toLocaleDateString("pt-BR");
}

function obterData(data) {
    if (!data) return null;
    const valor = String(data);
    const dataLocal = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
    return Number.isNaN(dataLocal.getTime()) ? null : dataLocal;
}

function agruparPorEstado(registros, periodo) {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - Number(periodo) + 1);
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const totais = registros.reduce((acumulado, registro) => {
        const data = obterData(registro.paciente?.dtPedido ?? registro.dtPedido);
        if (!data || data < inicio || data > fim) return acumulado;

        const estado = registro.paciente?.endereco?.estado ?? registro.endereco?.estado ?? "Não informado";
        acumulado[estado] = (acumulado[estado] ?? 0) + 1;
        return acumulado;
    }, {});
    const regioes = Object.entries(totais)
        .map(([estado, total]) => ({ estado, total }))
        .sort((a, b) => b.total - a.total || a.estado.localeCompare(b.estado))
        .slice(0, 6);

    return {
        regioes,
        maximo: Math.max(1, ...regioes.map(({ total }) => total)),
    };
}

function formatarStatus(status) {
    const normalizado = normalizarStatus(status);
    const conhecidos = {
        preparando: "Preparando",
        "em-transito": "Em trânsito",
        enviado: "Enviado",
        entregue: "Entregue",
        pendente: "Pendente",
        cancelado: "Cancelado",
    };
    return conhecidos[normalizado] ?? (status || "Não informado");
}

function DashboardEnvios({ irParaFormulario, irParaMadrinhas, irParaPacientes, irParaDocumentos, sair }) {
    const [kits, setKits] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [periodo, setPeriodo] = useState("7");
    const [busca, setBusca] = useState("");
    const [filtroAberto, setFiltroAberto] = useState(false);
    const [statusFiltro, setStatusFiltro] = useState("");
    const [pagina, setPagina] = useState(1);
    const [selecionados, setSelecionados] = useState([]);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([listarKits(), listarTodosPacientes()])
            .then(([resultadoKits, resultadoPacientes]) => {
                if (!ativo) return;
                if (resultadoKits.status === "fulfilled") setKits(resultadoKits.value);
                if (resultadoPacientes.status === "fulfilled") setPacientes(resultadoPacientes.value);

                const falha = [resultadoKits, resultadoPacientes].find((resultado) => resultado.status === "rejected");
                if (falha) {
                    setErro(falha.reason?.response?.data?.mensagem ?? "Não foi possível carregar todos os dados dos envios.");
                }
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const temStatusEntrega = kits.some((kit) => kit.status ?? kit.statusEntrega ?? kit.statusEnvio);
    const kitsEntregues = kits.filter((kit) => ["entregue", "delivered"].includes(normalizarStatus(kit.status ?? kit.statusEntrega ?? kit.statusEnvio))).length;
    const kitsEmTransito = kits.filter((kit) => ["em-transito", "em-rota"].includes(normalizarStatus(kit.status ?? kit.statusEntrega ?? kit.statusEnvio))).length;
    const cards = [
        { titulo: "Total de Envios", valor: kits.length, descricao: "Kits retornados pela API", icone: "▦" },
        { titulo: "Entregues", valor: temStatusEntrega ? kitsEntregues : "-", descricao: temStatusEntrega ? "Status informado pela API" : "Status não informado pela API", icone: "✓" },
        { titulo: "Em Trânsito", valor: temStatusEntrega ? kitsEmTransito : "-", descricao: temStatusEntrega ? "Status informado pela API" : "Status não informado pela API", icone: "▰" },
    ];
    const envios = kits.map((kit, indice) => ({
        key: kit.id ?? kit.kitId ?? indice,
        id: kit.id ?? kit.kitId ?? "-",
        cliente: kit.paciente?.nomeCompleto ?? kit.paciente?.nome ?? `Paciente ${kit.pacienteId ?? kit.paciente?.id ?? "-"}`,
        email: kit.paciente?.email ?? "-",
        produto: kit.corPeruca && kit.corPeruca !== "A definir" ? `Peruca ${kit.corPeruca}` : "Kit de peruca",
        data: formatarData(kit.paciente?.dtPedido ?? kit.dataCadastro ?? kit.dataSolicitacao ?? kit.createdAt),
        status: formatarStatus(kit.status ?? kit.statusEntrega ?? kit.statusEnvio),
    }));
    const statusDisponiveis = [...new Set(envios.map((envio) => envio.status))].sort();

    const dadosGraficos = {
        envios: agruparPorEstado(kits, periodo),
        solicitacoes: agruparPorEstado(pacientes, periodo),
    };

    const enviosFiltrados = envios.filter((envio) => {
        const correspondeBusca = `${envio.id} ${envio.cliente} ${envio.email} ${envio.produto}`
            .toLowerCase().includes(busca.toLowerCase());
        return correspondeBusca && (!statusFiltro || normalizarStatus(envio.status) === normalizarStatus(statusFiltro));
    });
    const itensPorPagina = 5;
    const totalPaginas = Math.max(1, Math.ceil(enviosFiltrados.length / itensPorPagina));
    const paginaAtual = Math.min(pagina, totalPaginas);
    const enviosVisiveis = enviosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

    function alternarSelecao(id) {
        setSelecionados((atuais) => atuais.includes(id)
            ? atuais.filter((selecionado) => selecionado !== id)
            : [...atuais, id]);
    }

    function renderGrafico(titulo, dados, cor, unidade) {
        return (
            <section className="graficoEnvios" aria-label={titulo}>
                <div className="cabecalhoGrafico">
                    <h2>{titulo}</h2>
                    <label className="seletorPeriodo">
                        <span className="visualmenteOculto">Período do gráfico {titulo}</span>
                        <select value={periodo} onChange={(evento) => setPeriodo(evento.target.value)}>
                            <option value="7">Pedidos nos últimos 7 dias</option>
                            <option value="30">Pedidos nos últimos 30 dias</option>
                        </select>
                    </label>
                </div>
                <div className="graficoPlot">
                    <div className="rotulosEixo" aria-hidden="true">
                        {[dados.maximo, Math.ceil(dados.maximo * 2 / 3), Math.ceil(dados.maximo / 3), 0]
                            .map((marca, indice) => <span key={`${marca}-${indice}`}>{marca}</span>)}
                    </div>
                    <div className="areaGrafico">
                        <div className="linhasGrade" aria-hidden="true">
                            <span /><span /><span /><span />
                        </div>
                        <div className="colunasGrafico">
                            {dados.regioes.map(({ estado, total }) => (
                                <div className="colunaGrafico" key={estado}>
                                    <div className="barraGrafico" style={{ height: `${total / dados.maximo * 100}%`, backgroundColor: cor }} title={`${total} ${unidade}`} />
                                    <span>{estado}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {dados.regioes.length === 0 && <p>Nenhum registro no período selecionado.</p>}
            </section>
        );
    }

    return (
        <div className="app">
            <Navbar irParaFormulario={irParaFormulario} irParaMadrinhas={irParaMadrinhas} irParaPacientes={irParaPacientes} irParaDocumentos={irParaDocumentos} pagina="envios" sair={sair} />
            <main className="conteudo conteudoEnvios">
                <section className="resumoEnvios">
                    <div className="resumoPrincipalEnvios">
                        <Header titulo="Dashboard de Envios"
                            descricao="Acompanhe os dados de envio de perucas em tempo real" mostrarBotao={false} />
                        <div className="cards cardsEnvios">
                            {cards.map((card) => <CardInfo key={card.titulo} {...card} />)}
                        </div>
                    </div>
                    <RankingRegioes kits={kits} />
                </section>
                {carregando && <p>Carregando kits...</p>}
                {erro && <p role="alert">{erro}</p>}

                <section className="graficosEnvios">
                    {renderGrafico("Envios por Estado", dadosGraficos.envios, "#E91E63", "envios")}
                    {renderGrafico("Solicitações por Estado", dadosGraficos.solicitacoes, "#F48FB1", "solicitações")}
                </section>

                <section className="tabelaEnvios">
                    <div className="cabecalhoTabelaEnvios">
                        <h2>Envios Recentes</h2>
                        <div className="controlesTabela">
                            <label className="buscaEnvios">
                                <span className="visualmenteOculto">Buscar envios</span>
                                <input value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }} placeholder="Buscar..." />
                            </label>
                            <button className={`botaoFiltro ${filtroAberto ? "selecionado" : ""}`}
                                type="button" aria-label="Filtrar por status" aria-expanded={filtroAberto}
                                onClick={() => setFiltroAberto((aberto) => !aberto)}>▼</button>
                            {filtroAberto && (
                                <select className="filtroStatus" aria-label="Status dos envios"
                                    value={statusFiltro} onChange={(evento) => { setStatusFiltro(evento.target.value); setPagina(1); }}>
                                    <option value="">Todos os status</option>
                                    {statusDisponiveis.map((status) => <option key={status}>{status}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="rolagemTabelaEnvios">
                        <table>
                            <thead><tr>
                                <th aria-label="Selecionar envio"></th><th>ID</th><th>Cliente</th><th>Produto</th><th>Data</th><th>Status</th><th>Ações</th>
                            </tr></thead>
                            <tbody>
                                {enviosVisiveis.map((envio) => (
                                    <tr key={envio.key}>
                                        <td><input type="checkbox" aria-label={`Selecionar envio ${envio.id}`}
                                            checked={selecionados.includes(envio.key)} onChange={() => alternarSelecao(envio.key)} /></td>
                                        <td>#{envio.id}</td>
                                        <td><strong>{envio.cliente}</strong><small>{envio.email}</small></td>
                                        <td>{envio.produto}</td><td>{envio.data}</td>
                                        <td><span className={`status status-${envio.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`}>{envio.status}</span></td>
                                        <td className="acoes">
                                            <button className="btn-editar" type="button">Editar</button>
                                            <button className="btn-excluir" type="button">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                                {!carregando && enviosVisiveis.length === 0 && <tr><td className="semResultados" colSpan="7">Nenhum envio encontrado.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <footer className="rodapeTabelaEnvios">
                        <span>Mostrando {enviosFiltrados.length ? (paginaAtual - 1) * itensPorPagina + 1 : 0} a {Math.min(paginaAtual * itensPorPagina, enviosFiltrados.length)} de {enviosFiltrados.length} resultados</span>
                        <div className="paginacaoEnvios">
                            <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}>Anterior</button>
                            {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                                <button type="button" key={numero} className={numero === paginaAtual ? "paginaAtual" : ""}
                                    aria-current={numero === paginaAtual ? "page" : undefined} onClick={() => setPagina(numero)}>{numero}</button>
                            ))}
                            <button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>Próximo</button>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
}

export default DashboardEnvios;
