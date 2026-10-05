import "./Tabela.css";
import LinhaTabela from "../LinhaTabela/LinhaTabela";
function Tabela({ dados, tipo }) {
    return (
        <div className="containerTabela">
            <div className="tabela">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{tipo === "madrinhas"? "Voluntária": "Paciente"}</th>

                            {tipo === "madrinhas" ? (
                                <><th>Horas Voluntárias</th>
                                    <th>Função</th></>
                            ) : (
                                <><th>Idade</th>
                                    <th>Tipo de Tratamento</th></>
                            )}
                            <th>Data Cadastro</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dados.map((item) => (
                            <LinhaTabela
                                key={item.id}
                                dados={item}
                                tipo={tipo}/>

                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default Tabela;