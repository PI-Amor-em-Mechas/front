import "./Tabela.css";
import LinhaTabela from "../LinhaTabela/LinhaTabela";

function formatarData(data) {
    if (!data) return "-";
    const dataLocal = new Date(`${data}T00:00:00`);
    return Number.isNaN(dataLocal.getTime()) ? "-" : dataLocal.toLocaleDateString("pt-BR");
}

function Tabela({ madrinhas }) {
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
                                    status: madrinha.status
                                        ? `${madrinha.status[0].toUpperCase()}${madrinha.status.slice(1).toLowerCase()}`
                                        : "-",
                                }}
                                tipo="madrinhas"
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