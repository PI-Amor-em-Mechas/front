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
                        {madrinhas.map((m) => (<LinhaTabela
                                key={m.id}
                                id={m.id}
                                nome={m.nomeCompleto}
                                email={m.email}
                                horas={`${m.horasVoluntarias ?? 0} horas`}
                                funcao={m.funcao}
                                data={formatarData(m.dataCadastro)}
                                status={m.status ? `${m.status[0].toUpperCase()}${m.status.slice(1).toLowerCase()}` : "-"}
                            />
                        ))}
                        {madrinhas.length === 0 && <tr><td colSpan="7">Nenhuma madrinha encontrada.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default Tabela;