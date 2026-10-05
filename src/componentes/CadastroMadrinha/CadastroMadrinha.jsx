import { useState } from "react";
import { cadastrarMadrinha } from "../../services/dashboardService";
import "./CadastroMadrinha.css";

function CadastroMadrinha({ fecharModal, aoSalvar }) {
    const [form, setForm] = useState({ nomeCompleto: "", email: "", horasVoluntarias: "0", funcao: "", status: "Ativa" });
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
            await cadastrarMadrinha({
                ...form,
                horasVoluntarias: Number(form.horasVoluntarias),
                dataCadastro: new Date().toISOString().slice(0, 10),
            });
            aoSalvar();
        } catch (error_) {
            setErro(error_.response?.data?.erro ?? error_.response?.data?.mensagem ?? "Não foi possível cadastrar a madrinha.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fundoModal">
            <form className="modal" onSubmit={enviar}>
                <button type="button" className="fechar" onClick={fecharModal}>×</button>
                <h1>Cadastro de Madrinha do amor</h1>
                <p>Preencha os dados aceitos no cadastro de voluntárias.</p>
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
                    <button type="submit" className="botaoCadastrar" disabled={enviando}>{enviando ? "Salvando..." : "Cadastrar"}</button>
                </div>
            </form>
        </div>
    );
}
export default CadastroMadrinha;