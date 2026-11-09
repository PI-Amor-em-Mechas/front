import { useEffect, useRef, useState } from "react";
import { Info, RefreshCw, Search, X } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import {
  buscarSolicitacao, encerrarSolicitacao, listarSolicitacoesAtivas, mensagemErroSolicitacao,
} from "../../services/solicitacoesAdminService";
import "../DashboardMadrinhas/DashboardMadrinhas.css";
import "../Tabela/Tabela.css";
import "./DashboardSolicitacoes.css";

function dataLocal(valor) {
  if (!valor) return "Não informado";
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-BR");
}

function Campo({ titulo, valor }) {
  return <div><dt>{titulo}</dt><dd>{valor === null || valor === undefined || valor === "" ? "Não informado" : valor}</dd></div>;
}

export function StatusSolicitacao({ status }) {
  return <span className="solicitacoes-status" data-status={status}>
    {({ ATIVA: "Ativa", CONCLUIDA: "Concluída", CANCELADA: "Cancelada" })[status]}
  </span>;
}

function DetalhesSolicitacao({ id, aoFechar, aoEncerrar }) {
  const dialog = useRef(null);
  const [detalhe, setDetalhe] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const elemento = dialog.current;
    const focoAnterior = document.activeElement;
    elemento.showModal();
    return () => {
      elemento.close();
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus();
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    buscarSolicitacao(id)
      .then((dados) => { if (ativo) setDetalhe(dados); })
      .catch((error_) => { if (ativo) setErro(mensagemErroSolicitacao(error_)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id, tentativa]);

  async function confirmar() {
    if (salvando || !confirmacao) return;
    setSalvando(true);
    setErro("");
    try {
      const resultado = await encerrarSolicitacao(id, confirmacao);
      aoEncerrar(resultado);
    } catch (error_) {
      setErro(mensagemErroSolicitacao(error_));
      setConfirmacao(null);
    } finally {
      setSalvando(false);
    }
  }

  const paciente = detalhe?.paciente;
  const medico = paciente?.dadosMedicos;
  const endereco = paciente?.endereco;

  return <dialog ref={dialog} className="solicitacoes-modal" aria-labelledby="solicitacao-titulo"
    onCancel={(evento) => { evento.preventDefault(); if (!salvando) aoFechar(); }}
    onKeyDown={(evento) => {
      if (evento.key === "Escape") { evento.preventDefault(); if (!salvando) aoFechar(); }
    }}>
    <div className="solicitacoes-modal-cabecalho">
      <div><h2 id="solicitacao-titulo">Solicitação #{id}</h2><p>Detalhes do pedido de peruca</p></div>
      <button type="button" autoFocus aria-label="Fechar detalhes" className="solicitacoes-icone" disabled={salvando} onClick={aoFechar}><X size={22} /></button>
    </div>
    {carregando && <p role="status">Carregando detalhes...</p>}
    {erro && <p className="solicitacoes-erro" role="alert">{erro}</p>}
    {!carregando && !detalhe && <button type="button" onClick={() => {
      setErro(""); setCarregando(true); setTentativa((valor) => valor + 1);
    }}>Tentar novamente</button>}
    {paciente && <>
      <StatusSolicitacao status={detalhe.status} />
      <section><h3>Paciente e contato</h3><dl className="solicitacoes-campos">
        <Campo titulo="Nome completo" valor={paciente.nomeCompleto} />
        <Campo titulo="E-mail" valor={paciente.email} />
        <Campo titulo="Celular" valor={paciente.cel} />
        <Campo titulo="CPF" valor={paciente.cpf} />
        <Campo titulo="Nascimento" valor={dataLocal(paciente.dtNasc)} />
        <Campo titulo="Idade" valor={paciente.idade == null ? null : `${paciente.idade} anos`} />
        <Campo titulo="Data do pedido" valor={dataLocal(paciente.dtPedido)} />
        <Campo titulo="Solicitante" valor={detalhe.nomeSolicitante} />
      </dl></section>
      <section><h3>Endereço</h3><dl className="solicitacoes-campos">
        <Campo titulo="Rua" valor={endereco?.rua} />
        <Campo titulo="Número" valor={endereco?.numero} />
        <Campo titulo="Complemento" valor={endereco?.complemento} />
        <Campo titulo="Bairro" valor={endereco?.bairro} />
        <Campo titulo="Cidade / UF" valor={[endereco?.cidade, endereco?.estado].filter(Boolean).join(" / ")} />
        <Campo titulo="CEP" valor={endereco?.cep} />
      </dl></section>
      <section><h3>Dados familiares</h3><dl className="solicitacoes-campos">
        <Campo titulo="Estado civil" valor={paciente.estadoCivil} />
        <Campo titulo="Pessoas na residência" valor={paciente.qtdPessoasEmCasa} />
        <Campo titulo="Tem filhos" valor={paciente.temFilhos == null ? null : paciente.temFilhos ? "Sim" : "Não"} />
        <Campo titulo="Idades dos filhos" valor={paciente.filhos?.map((filho) => `${filho.idade} anos`).join(", ") || (paciente.temFilhos === false ? "Não se aplica" : null)} />
      </dl></section>
      <section><h3>Dados médicos</h3>{medico ? <dl className="solicitacoes-campos">
        <Campo titulo="Motivo da solicitação" valor={medico.motivo} />
        <Campo titulo="Tipo de câncer" valor={medico.tipoCancer} />
        <Campo titulo="Início do tratamento" valor={dataLocal(medico.dtInicioTratamento)} />
        <Campo titulo="Tipo de atendimento" valor={medico.tipoAtendimento} />
        <Campo titulo="Justificativa" valor={medico.justificativa} />
      </dl> : <p>Dados médicos ainda não cadastrados. O formulário pode estar aguardando validação do laudo.</p>}</section>
      <section><h3>Kit de peruca</h3>{detalhe.kits.length ? <ul>
        {detalhe.kits.map((kit) => <li key={kit.id}>Kit #{kit.id} — Cor: {kit.corPeruca || "Não informada"}</li>)}
      </ul> : <p>Kit ainda não cadastrado.</p>}</section>
      {detalhe.status === "ATIVA" && <div className="solicitacoes-modal-acoes">
        {confirmacao ? <>
          <p>Confirma {confirmacao === "CONCLUIDA" ? "concluir" : "cancelar"} esta solicitação? Ela sairá da lista de ativas. O cadastro da paciente será preservado.</p>
          <button type="button" disabled={salvando} onClick={() => setConfirmacao(null)}>Voltar</button>
          <button type="button" className="solicitacoes-primario" disabled={salvando} onClick={confirmar}>
            {salvando ? "Salvando..." : "Confirmar"}
          </button>
        </> : <>
          <button type="button" onClick={() => setConfirmacao("CANCELADA")}>Cancelar solicitação</button>
          <button type="button" className="solicitacoes-primario" onClick={() => setConfirmacao("CONCLUIDA")}>Concluir solicitação</button>
        </>}
      </div>}
    </>}
  </dialog>;
}

export default function DashboardSolicitacoes(props) {
  const [consulta, setConsulta] = useState({ page: 0, busca: "", revisao: 0 });
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let ativo = true;
    listarSolicitacoesAtivas(consulta)
      .then((dados) => {
        if (!ativo) return;
        if (consulta.page > 0 && consulta.page >= dados.totalPages) {
          setConsulta((atual) => ({ ...atual, page: Math.max(0, dados.totalPages - 1) }));
        } else {
          setResultado(dados);
          setCarregando(false);
        }
      })
      .catch((error_) => {
        if (ativo) { setErro(mensagemErroSolicitacao(error_)); setCarregando(false); }
      });
    return () => { ativo = false; };
  }, [consulta]);

  function consultar(alteracoes = {}) {
    setErro("");
    setCarregando(true);
    setConsulta((atual) => ({ ...atual, ...alteracoes, revisao: atual.revisao + 1 }));
  }

  return <div className="app solicitacoes">
    <Navbar {...props} pagina="solicitacoes" />
    <main className="conteudo">
      <Header titulo="Solicitações de peruca" descricao="Acompanhe e gerencie os pedidos ativos" mostrarBotao={false} />
      <div className="solicitacoes-resumo">
        <div><strong>{resultado ? resultado.totalElements : "—"}</strong><span>solicitações ativas{consulta.busca ? " na busca" : ""}</span></div>
        <p>Use o ícone de informação para consultar os detalhes e encerrar um atendimento.</p>
      </div>
      <form className="solicitacoes-filtros" onSubmit={(evento) => { evento.preventDefault(); consultar({ page: 0, busca: busca.trim() }); }}>
        <label htmlFor="busca-solicitacoes">Buscar por nome ou e-mail</label>
        <div><input id="busca-solicitacoes" type="search" value={busca} placeholder="Nome da paciente ou e-mail"
          onChange={(evento) => setBusca(evento.target.value)} />
          <button type="submit" className="solicitacoes-primario" disabled={carregando}><Search size={18} /> Buscar</button>
          <button type="button" disabled={carregando} onClick={() => consultar()}><RefreshCw size={18} /> Atualizar</button>
        </div>
      </form>
      {feedback && <p role="status" className="solicitacoes-feedback">{feedback}</p>}
      {erro && <p role="alert" className="solicitacoes-erro">{erro}</p>}
      <div className="containerTabela" aria-busy={carregando}>
        <div className="tabela">
          <table><caption className="solicitacoes-sr">Solicitações ativas de peruca</caption>
            <thead><tr><th scope="col">Pedido</th><th scope="col">Paciente</th><th scope="col">Data do pedido</th><th scope="col">Localidade</th><th scope="col">Status</th><th scope="col">Detalhes</th></tr></thead>
            <tbody>{!carregando && !erro && resultado?.content.map((item) => <tr key={item.id}>
              <td>#{item.id}</td>
              <td><strong>{item.nomePaciente}</strong><br /><span>{item.email || "E-mail não informado"}</span></td>
              <td>{dataLocal(item.dtPedido)}</td>
              <td>{[item.cidade, item.estado].filter(Boolean).join(" / ") || "Não informada"}</td>
              <td><StatusSolicitacao status={item.status} /></td>
              <td><button type="button" className="solicitacoes-icone" title="Ver detalhes"
                aria-label={`Ver detalhes da solicitação #${item.id} de ${item.nomePaciente}`} onClick={() => setSelecionada(item.id)}><Info size={22} /></button></td>
            </tr>)}</tbody>
          </table>
          {carregando && <p className="solicitacoes-estado" role="status">Carregando solicitações...</p>}
          {!carregando && !erro && resultado?.content.length === 0 && <p className="solicitacoes-estado">
            {consulta.busca ? "Nenhuma solicitação ativa encontrada para essa busca." : "Nenhuma solicitação ativa no momento."}
          </p>}
          {!carregando && erro && <p className="solicitacoes-estado">Lista indisponível. Use Atualizar para tentar novamente.</p>}
        </div>
      </div>
      <div className="solicitacoes-paginacao">
        <button type="button" disabled={carregando || !!erro || consulta.page === 0} onClick={() => consultar({ page: consulta.page - 1 })}>Anterior</button>
        <span>Página {resultado?.totalPages ? consulta.page + 1 : 0} de {resultado?.totalPages ?? 0}</span>
        <button type="button" disabled={carregando || !!erro || consulta.page + 1 >= (resultado?.totalPages ?? 0)} onClick={() => consultar({ page: consulta.page + 1 })}>Próxima</button>
      </div>
    </main>
    {selecionada !== null && <DetalhesSolicitacao key={selecionada} id={selecionada} aoFechar={() => setSelecionada(null)}
      aoEncerrar={(atualizada) => {
        setSelecionada(null);
        setFeedback(`Solicitação #${atualizada.id} ${atualizada.status === "CONCLUIDA" ? "concluída" : "cancelada"} com sucesso.`);
        consultar();
      }} />}
  </div>;
}
