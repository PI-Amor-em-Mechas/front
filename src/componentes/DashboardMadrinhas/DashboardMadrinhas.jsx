import { useEffect, useState } from "react";
import "./DashboardMadrinhas.css";

import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";
import CadastroMadrinha from "../CadastroMadrinha/CadastroMadrinha";
import { listarMadrinhas } from "../../services/dashboardService";

function DashboardMadrinhas({ irParaFormulario, irParaEnvios, irParaPacientes, sair }) {
  const [mostrarModal, setMostrarModal] = useState(false);
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

  const horasTotais = madrinhas.reduce((total, madrinha) => total + Number(madrinha.horasVoluntarias ?? 0), 0);
  const maisHoras = madrinhas.reduce((maior, madrinha) => (
    Number(madrinha.horasVoluntarias ?? 0) > Number(maior?.horasVoluntarias ?? -1) ? madrinha : maior
  ), null);
  const ativas = madrinhas.filter((madrinha) => madrinha.status?.toLowerCase() === "ativa").length;
  const cards = [
    { titulo: "Total de Madrinhas", valor: madrinhas.length, descricao: "Cadastros retornados pela API" },
    { titulo: "Madrinha com Mais Horas", valor: maisHoras?.nomeCompleto ?? "-", descricao: maisHoras ? `${maisHoras.horasVoluntarias} horas` : "Sem registros" },
    { titulo: "Total de Horas Voluntárias", valor: `${horasTotais} horas`, descricao: "Soma dos cadastros" },
    { titulo: "Madrinhas Ativas", valor: ativas, descricao: "Status atual" },
  ];

  const madrinhasFiltradas = madrinhas.filter((madrinha) => {
    const busca = filtros.busca.trim().toLowerCase();
    const correspondeBusca = !busca || `${madrinha.id} ${madrinha.nomeCompleto} ${madrinha.email}`.toLowerCase().includes(busca);
    const correspondeStatus = !filtros.status || madrinha.status?.toLowerCase() === filtros.status.toLowerCase();
    const correspondeHoras = filtros.horas === "" || Number(madrinha.horasVoluntarias ?? 0) >= Number(filtros.horas);
    const correspondeMes = !filtros.mes || madrinha.dataCadastro?.startsWith(filtros.mes);
    return correspondeBusca && correspondeStatus && correspondeHoras && correspondeMes;
  });

  return (
    <div className="app">
      <Navbar irParaFormulario={irParaFormulario} irParaEnvios={irParaEnvios} irParaPacientes={irParaPacientes} pagina="madrinhas" sair={sair} />
      <main className="conteudo">
        <Header abrirModal={() => setMostrarModal(true)} />
        <section className="cards">
          {cards.map((card) => <CardInfo key={card.titulo} {...card} />)}
        </section>
        {erro && <p role="alert">{erro}</p>}
        <Filtros filtros={filtros} aoAlterar={setFiltros} />
        {carregando ? <p>Carregando madrinhas...</p> : <Tabela madrinhas={madrinhasFiltradas} />}
      </main>
      {mostrarModal && <CadastroMadrinha
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
