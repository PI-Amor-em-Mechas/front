import { useEffect, useState } from "react";
import "./DashboardMadrinhas.css";

import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";
import CadastroMadrinha from "../CadastroMadrinha/CadastroMadrinha";
import { listarMadrinhas, removerMadrinha } from "../../services/dashboardService";

function normalizarStatus(status) {
  return String(status ?? "").trim().toLowerCase();
}

function minutosDaMadrinha(madrinha) {
  if (madrinha.minutosVoluntarios != null) return Number(madrinha.minutosVoluntarios);
  return Number(madrinha.horasVoluntarias ?? 0) * 60;
}

function formatarDuracao(minutos) {
  const total = Math.max(0, Number(minutos) || 0);
  if (total < 60) return `${total}min`;
  const horas = Math.floor(total / 60);
  const restantes = total % 60;
  return restantes ? `${horas}h ${restantes}min` : `${horas}h`;
}

function DashboardMadrinhas({ irParaFormulario, irParaEnvios, irParaPacientes, irParaDocumentos, irParaSolicitacoes, sair }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [madrinhaEmEdicao, setMadrinhaEmEdicao] = useState(null);
  const [madrinhas, setMadrinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [filtros, setFiltros] = useState({ busca: "", status: "", horas: "", mes: "" });

  useEffect(() => {
    let ativo = true;
    listarMadrinhas()
      .then((dados) => { if (ativo) setMadrinhas(dados); })
      .catch((error_) => {
        if (ativo) setErro(error_.response?.data?.mensagem ?? "Não foi possível carregar as madrinhas.");
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [atualizacao]);

  const minutosTotais = madrinhas.reduce((total, madrinha) => total + minutosDaMadrinha(madrinha), 0);
  const maisHoras = madrinhas.reduce((maior, madrinha) => (
    minutosDaMadrinha(madrinha) > (maior ? minutosDaMadrinha(maior) : -1) ? madrinha : maior
  ), null);
  const ativas = madrinhas.filter((madrinha) => normalizarStatus(madrinha.status) === "ativa").length;
  const cards = [
    { titulo: "Total de Madrinhas", valor: madrinhas.length, descricao: "Cadastros retornados pela API" },
    { titulo: "Madrinha com Mais Horas", valor: maisHoras?.nomeCompleto ?? "-", descricao: maisHoras ? formatarDuracao(minutosDaMadrinha(maisHoras)) : "Sem registros" },
    { titulo: "Total de Horas Voluntárias", valor: formatarDuracao(minutosTotais), descricao: "Soma dos cadastros" },
    { titulo: "Madrinhas Ativas", valor: ativas, descricao: "Status atual" },
  ];

  const madrinhasFiltradas = madrinhas.filter((madrinha) => {
    const busca = filtros.busca.trim().toLowerCase();
    const correspondeBusca = !busca || `${madrinha.id} ${madrinha.nomeCompleto} ${madrinha.email}`.toLowerCase().includes(busca);
    const correspondeStatus = !filtros.status || normalizarStatus(madrinha.status) === normalizarStatus(filtros.status);
    const correspondeHoras = filtros.horas === "" || minutosDaMadrinha(madrinha) >= Number(filtros.horas) * 60;
    const correspondeMes = !filtros.mes || madrinha.dataCadastro?.startsWith(filtros.mes);
    return correspondeBusca && correspondeStatus && correspondeHoras && correspondeMes;
  });

  async function excluirMadrinha(madrinha) {
    if (!window.confirm(`Deseja excluir a madrinha ${madrinha.nomeCompleto}?`)) return;
    setErro("");
    try {
      await removerMadrinha(madrinha.id);
      setMadrinhas((atuais) => atuais.filter((atual) => atual.id !== madrinha.id));
    } catch (error_) {
      setErro(error_.response?.data?.mensagem ?? error_.response?.data?.erro ?? "Não foi possível excluir a madrinha.");
    }
  }

  return (
    <div className="app">
      <Navbar irParaFormulario={irParaFormulario} irParaEnvios={irParaEnvios} irParaPacientes={irParaPacientes} irParaDocumentos={irParaDocumentos} irParaSolicitacoes={irParaSolicitacoes} pagina="madrinhas" sair={sair} />
      <main className="conteudo">
        <Header abrirModal={() => { setMadrinhaEmEdicao(null); setMostrarModal(true); }} />
        <section className="cards">
          {cards.map((card) => <CardInfo key={card.titulo} {...card} />)}
        </section>
        {erro && <p role="alert">{erro}</p>}
        <Filtros filtros={filtros} aoAlterar={setFiltros} />
        {carregando ? <p>Carregando madrinhas...</p> : <Tabela
          madrinhas={madrinhasFiltradas}
          aoEditar={(madrinha) => { setMadrinhaEmEdicao(madrinha); setMostrarModal(true); }}
          aoExcluir={excluirMadrinha}
        />}
      </main>
      {mostrarModal && <CadastroMadrinha
        madrinha={madrinhaEmEdicao}
        fecharModal={() => setMostrarModal(false)}
        aoSalvar={() => {
          setMostrarModal(false);
          setErro("");
          setCarregando(true);
          setAtualizacao((atual) => atual + 1);
        }}
      />}
    </div>
  );
}

export default DashboardMadrinhas;
