import { useState } from "react";
import { atualizarMadrinha, cadastrarMadrinha } from "../../services/dashboardService";
import "./CadastroMadrinha.css";

function CadastroMadrinha({ fecharModal, aoSalvar, madrinha = null }) {
    const [form, setForm] = useState(() => ({
        nomeCompleto: madrinha?.nomeCompleto ?? "",
        email: madrinha?.email ?? "",
        horasVoluntarias: String(madrinha?.horasVoluntarias ?? 0),
        funcao: madrinha?.funcao ?? "",
        status: madrinha?.status ?? "Ativa",
    }));
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    function alterar(campo, valor) {
        setForm((atual) => ({ ...atual, [campo]: valor }));
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErro("");
        setEnviando(true);
        try {
            const dados = {
                ...form,
                horasVoluntarias: Number(form.horasVoluntarias),
                dataCadastro: madrinha?.dataCadastro ?? new Date().toISOString().slice(0, 10),
            };
            if (madrinha) {
                await atualizarMadrinha(madrinha.id, dados);
            } else {
                await cadastrarMadrinha(dados);
            }
            aoSalvar();
        } catch (error_) {
            setErro(error_.response?.data?.erro ?? error_.response?.data?.mensagem ?? "Não foi possível cadastrar a madrinha.");
        } finally {
            setEnviando(false);
        }
    }

    let textoBotao = madrinha ? "Salvar alterações" : "Cadastrar";
    if (enviando) textoBotao = "Salvando...";

    return (
        <div className="fundoModal">
            <form className="modal" onSubmit={enviar}>
                <button type="button" className="fechar" onClick={fecharModal}>×</button>
                <h1>{madrinha ? "Editar madrinha do amor" : "Cadastro de Madrinha do amor"}</h1>
                <p>{madrinha ? "Atualize os dados da voluntária." : "Preencha os dados aceitos no cadastro de voluntárias."}</p>
                <div className="formularioMadrinha">
                    <label>
                        <span>Nome completo *</span>
                        <input required value={form.nomeCompleto} onChange={(evento) => alterar("nomeCompleto", evento.target.value)} />
                    </label>
                    <label>
                        <span>E-mail *</span>
                        <input type="email" required value={form.email} onChange={(evento) => alterar("email", evento.target.value)} />
                    </label>
                    <label>
                        <span>Horas voluntárias *</span>
                        <input type="number" min="0" required value={form.horasVoluntarias} onChange={(evento) => alterar("horasVoluntarias", evento.target.value)} />
                    </label>
                    <label>
                        <span>Função *</span>
                        <input required value={form.funcao} onChange={(evento) => alterar("funcao", evento.target.value)} />
                    </label>
                    <label>
                        <span>Status *</span>
                        <select value={form.status} onChange={(evento) => alterar("status", evento.target.value)}>
                            <option value="Ativa">Ativa</option>
                            <option value="Afastada">Afastada</option>
                            <option value="Desassociada">Desassociada</option>
                        </select>
                    </label>
                </div>
                {erro && <p className="erroCadastro" role="alert">{erro}</p>}
                <div className="botoesModal">
                    <button type="button" className="botaoVoltar" onClick={fecharModal}>Cancelar</button>
                    <button type="submit" className="botaoCadastrar" disabled={enviando}>
                        {textoBotao}
                    </button>
                </div>
            </form>
        </div>
    );
}
export default CadastroMadrinha;