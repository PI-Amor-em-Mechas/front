import { useEffect, useState } from "react";
import { Download, Eye, RefreshCw, X } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import { podeRevisarDocumentos } from "../../services/authService";
import { listarPendentes, revisarArquivo, obterConteudoArquivo, mensagemErroArquivo } from "../../services/arquivoService";
import "./RevisaoDocumentos.css";

function dataUpload(documento) {
  const data = documento.dataUpload;
  if (!data || Number.isNaN(new Date(data).getTime())) return "Não informada pela API";
  return new Date(data).toLocaleString("pt-BR");
}

export default function RevisaoDocumentos(props) {
  const [documentos, setDocumentos] = useState([]);
  const [observacoes, setObservacoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(null);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [atualizacao, setAtualizacao] = useState(0);
  const [visualizacao, setVisualizacao] = useState(null);
  const autorizado = podeRevisarDocumentos();

  useEffect(() => {
    if (!autorizado) return;
    let ativo = true;
    listarPendentes()
      .then((dados) => { if (ativo) setDocumentos(dados); })
      .catch((error_) => { if (ativo) setErro(mensagemErroArquivo(error_)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [atualizacao, autorizado]);

  useEffect(() => {
    return () => { if (visualizacao) URL.revokeObjectURL(visualizacao.url); };
  }, [visualizacao]);

  async function revisar(documento, decisao) {
    if (ocupado !== null) return;
    const observacao = observacoes[documento.id] ?? "";
    if (decisao === "REJEITADO" && !observacao.trim()) {
      setErro("Informe a observação da rejeição antes de confirmar.");
      return;
    }
    setOcupado(documento.id);
    setErro("");
    setFeedback(null);
    try {
      const resultado = await revisarArquivo(documento.id, decisao, observacao);
      setDocumentos((atuais) => atuais.filter((item) => item.id !== resultado.id));
      setFeedback(resultado);
      setVisualizacao(null);
    } catch (error_) {
      setErro(mensagemErroArquivo(error_));
    } finally {
      setOcupado(null);
    }
  }

  async function abrir(documento, baixar = false) {
    if (ocupado !== null) return;
    setOcupado(documento.id);
    setErro("");
    try {
      const { conteudo, documento: atual } = await obterConteudoArquivo(documento.id);
      const url = URL.createObjectURL(conteudo);
      if (baixar) {
        const link = document.createElement("a");
        link.href = url;
        link.download = atual.nome || "documento";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setVisualizacao({ url, documento: atual });
      }
    } catch (error_) {
      setErro(mensagemErroArquivo(error_));
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="revisao-documentos">
      <Navbar {...props} pagina="documentos" />
      <main className="documentos-conteudo">
        <div className="documentos-cabecalho">
          <h1>Documentos médicos</h1>
          {autorizado && <button type="button" className="documentos-icone" title="Atualizar lista" aria-label="Atualizar lista"
            disabled={carregando || ocupado !== null} onClick={() => { setCarregando(true); setErro(""); setAtualizacao((valor) => valor + 1); }}><RefreshCw size={20} /></button>}
        </div>
        {!autorizado ? <p role="alert">Acesso restrito. Apenas administradores, médicos e enfermeiros podem revisar documentos.</p> : <>
          {erro && <p className="documentos-erro" role="alert">{erro}</p>}
          {feedback && <div className="documentos-feedback" aria-live="polite">
            <strong>{feedback.nomeOriginal || feedback.nome}: {feedback.statusValidacao}</strong>
            {feedback.statusValidacao === "REJEITADO" && <p>{feedback.observacaoValidacao}</p>}
            {feedback.statusValidacao === "APROVADO" && <div className="documentos-acoes">
              <button type="button" className="documentos-icone" title="Visualizar documento aprovado" aria-label="Visualizar documento aprovado" disabled={ocupado !== null} onClick={() => abrir(feedback)}><Eye size={20} /></button>
              <button type="button" className="documentos-icone" title="Baixar documento aprovado" aria-label="Baixar documento aprovado" disabled={ocupado !== null} onClick={() => abrir(feedback, true)}><Download size={20} /></button>
            </div>}
          </div>}
          {carregando && <output>Carregando documentos...</output>}
          {!carregando && documentos.length === 0 && <p>{erro ? "Lista indisponível. Tente atualizar novamente." : "Nenhum documento aguardando validação."}</p>}
          {!carregando && documentos.length > 0 &&
            <div className="documentos-tabela-scroll"><table className="documentos-tabela">
              <thead><tr><th scope="col">Arquivo</th><th scope="col">Tipo</th><th scope="col">Upload</th><th scope="col">Status</th><th scope="col">Revisão</th></tr></thead>
              <tbody>{documentos.map((documento) => <tr key={documento.id}>
                <td>{documento.nomeOriginal || documento.nome}</td>
                <td>{documento.mimeType}</td>
                <td>{dataUpload(documento)}</td>
                <td><strong>{documento.statusValidacao}</strong><p>{documento.statusValidacao === "PENDENTE" ? "Aguardando validação" : documento.observacaoValidacao}</p></td>
                <td><div className="documentos-revisao">
                  <label htmlFor={`observacao-${documento.id}`}>Observação</label>
                  <textarea id={`observacao-${documento.id}`} value={observacoes[documento.id] ?? ""}
                    disabled={ocupado !== null} onChange={(evento) => setObservacoes((atuais) => ({ ...atuais, [documento.id]: evento.target.value }))} />
                  <div className="documentos-acoes">
                    <button type="button" className="documentos-icone" title="Visualizar para revisão" aria-label={`Visualizar ${documento.nomeOriginal || documento.nome} para revisão`} disabled={ocupado !== null} onClick={() => abrir(documento)}><Eye size={20} /></button>
                    <button type="button" disabled={ocupado !== null || documento.statusValidacao !== "PENDENTE"} onClick={() => revisar(documento, "APROVADO")}>Aprovar</button>
                    <button type="button" className="documentos-rejeitar" disabled={ocupado !== null || documento.statusValidacao !== "PENDENTE"} onClick={() => revisar(documento, "REJEITADO")}>Rejeitar</button>
                  </div>
                  {ocupado === documento.id && <output>Processando...</output>}
                </div></td>
              </tr>)}</tbody>
            </table></div>}
        </>}
      </main>
      {visualizacao && <dialog open className="documentos-modal" aria-label="Visualização do documento" onCancel={() => setVisualizacao(null)} onKeyDown={(evento) => { if (evento.key === "Escape") setVisualizacao(null); }}>
        <div className="documentos-cabecalho"><h2>{visualizacao.documento.nomeOriginal || visualizacao.documento.nome}</h2>
          <button type="button" autoFocus className="documentos-icone" title="Fechar documento" aria-label="Fechar documento" onClick={() => setVisualizacao(null)}><X size={20} /></button></div>
        {visualizacao.documento.mimeType === "application/pdf" ? <iframe title="Documento médico" src={visualizacao.url} /> :
          <img src={visualizacao.url} alt="Documento médico em revisão" />}
      </dialog>}
    </div>
  );
}