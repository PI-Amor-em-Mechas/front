import "./Tabela.css";
import LinhaTabela from "../LinhaTabela/LinhaTabela";

function formatarData(data) {
    if (!data) return "-";
    const dataLocal = new Date(`${data}T00:00:00`);
    return Number.isNaN(dataLocal.getTime()) ? "-" : dataLocal.toLocaleDateString("pt-BR");
}

function formatarStatus(status) {
    const valor = String(status ?? "");
    const statusConhecidos = {
        ativa: "Ativa",
        afastada: "Afastada",
        desassociada: "Desassociada",
    };
    return statusConhecidos[valor.trim().toLowerCase()] ?? (valor || "-");
}

function Tabela({ madrinhas, aoEditar, aoExcluir }) {
    return (
        <div className="containerTabela">
            <div className="tabela">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Voluntária</th>
                            <th>Horas Voluntárias</th>
                            <th>Função</th>
                            <th>Data Cadastro</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {madrinhas.map((madrinha) => (
                            <LinhaTabela
                                key={madrinha.id}
                                dados={{
                                    id: madrinha.id,
                                    nome: madrinha.nomeCompleto ?? "Sem nome",
                                    email: madrinha.email ?? "-",
                                    horas: `${madrinha.horasVoluntarias ?? 0} horas`,
                                    funcao: madrinha.funcao ?? "-",
                                    data: formatarData(madrinha.dataCadastro),
                                    status: formatarStatus(madrinha.status),
                                }}
                                tipo="madrinhas"
                                aoEditar={() => aoEditar(madrinha)}
                                aoExcluir={() => aoExcluir(madrinha)}
                            />
                        ))}
                        {madrinhas.length === 0 && <tr><td colSpan="7">Nenhuma madrinha encontrada.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default Tabela;