import { useEffect, useEffectEvent, useState } from "react";
import { RefreshCw, Square } from "lucide-react";
import { buscarArquivo, reprocessarComparacao, mensagemErroArquivo } from "../../services/arquivoService";
import { podeRevisarDocumentos } from "../../services/authService";
import { acompanharComparacao, comparacaoEmAndamento, rotuloComparacao, STATUS_COMPARACAO, CAMPOS_COMPARACAO, RESULTADOS_COMPARACAO } from "../../services/comparacaoService";
import "./ComparacaoDocumento.css";

export default function ComparacaoDocumento({ documento, aoAtualizar, ativo = true }) {
  const [interrompido, setInterrompido] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [erro, setErro] = useState("");
  const [reprocessando, setReprocessando] = useState(false);
  const autorizado = podeRevisarDocumentos();
  const executando = comparacaoEmAndamento(documento.statusComparacao) && !interrompido;
  const atualizar = useEffectEvent((atual) => aoAtualizar(atual));

  useEffect(() => {
    if (!executando || !ativo) return;
    const controle = new AbortController();
    acompanharComparacao({
      id: documento.id, signal: controle.signal, consultar: buscarArquivo,
      aoAtualizar: (atual) => atualizar(atual),
    }).then((resultado) => {
      if (controle.signal.aborted) return;
      setFeedback(resultado === "LIMITE" ? "Limite de consultas atingido. Consulte novamente mais tarde." : "");
      setInterrompido(true);
    }).catch((error_) => {
      if (controle.signal.aborted) return;
      setErro(mensagemErroArquivo(error_));
      setInterrompido(true);
    });
    return () => controle.abort();
  }, [documento.id, executando, rodada, ativo]);

  function iniciar() {
    setFeedback("");
    setErro("");
    setRodada((valor) => valor + 1);
    setInterrompido(false);
  }

  async function reprocessar() {
    if (reprocessando || !podeRevisarDocumentos()) return;
    setReprocessando(true);
    setErro("");
    try {
      await reprocessarComparacao(documento.id);
      const atual = await buscarArquivo(documento.id);
      aoAtualizar(atual);
      if (comparacaoEmAndamento(atual.statusComparacao)) iniciar();
    } catch (error_) {
      setErro(mensagemErroArquivo(error_));
    } finally {
      setReprocessando(false);
    }
  }

  const status = documento.statusComparacao;
  const campos = autorizado && documento.comparacaoCampos && typeof documento.comparacaoCampos === "object"
    ? Object.entries(documento.comparacaoCampos) : [];

  return (
    <section className="comparacao-documento" aria-label="Comparação de dados">
      <h3>Comparação de dados</h3>
      <p aria-live="polite">{rotuloComparacao(STATUS_COMPARACAO, status, "Status de comparação não informado")}</p>
      {autorizado && documento.pacienteId != null && <p>Paciente: {documento.pacienteId}</p>}
      {status === "CONCLUIDA" && autorizado && (campos.length ?
        <dl className="comparacao-campos">{campos.map(([campo, resultado]) => <div key={campo}>
          <dt>{rotuloComparacao(CAMPOS_COMPARACAO, campo, campo)}</dt>
          <dd className={`comparacao-${["CONFERE", "DIVERGENTE", "INCONCLUSIVO"].includes(resultado) ? resultado.toLowerCase() : "inconclusivo"}`}>
            {rotuloComparacao(RESULTADOS_COMPARACAO, resultado, "Resultado não informado")}
          </dd>
        </div>)}</dl> : <p>Nenhum resultado por campo disponível.</p>)}
      {status === "CONCLUIDA" && !autorizado && <p>Resultados detalhados restritos à equipe de revisão.</p>}
      {status === "FALHA" && <p>A comparação falhou. A decisão sobre o documento continua dependendo da revisão humana.</p>}
      <div className="comparacao-acoes">
        {executando ? <button type="button" onClick={() => { setInterrompido(true); setFeedback("Atualização automática interrompida."); }} title="Interromper atualização" aria-label="Interromper atualização"><Square size={18} /></button> :
          comparacaoEmAndamento(status) && <button type="button" onClick={iniciar} title="Acompanhar processamento" aria-label="Acompanhar processamento"><RefreshCw size={18} /></button>}
        {status === "FALHA" && autorizado && <button type="button" onClick={reprocessar} disabled={reprocessando}><RefreshCw size={18} /> Reprocessar comparação</button>}
      </div>
      {executando && ativo && <output>Atualizando a cada 5 segundos, até 24 consultas.</output>}
      {reprocessando && <output>Solicitando reprocessamento...</output>}
      {feedback && <p aria-live="polite">{feedback}</p>}
      {erro && <p className="comparacao-erro" role="alert">{erro}</p>}
      <p className="comparacao-aviso">A comparação não comprova legitimidade médica nem aprova ou rejeita o documento.</p>
    </section>
  );
}