import "./LinhaTabela.css";

function LinhaTabela({ dados, tipo }) {
    return (
        <tr>
            <td>
                {dados.id}
            </td>

            <td>
                <strong>{dados.nome}</strong><br />
                <span className="email">{dados.email}</span>
            </td>

            {tipo === "madrinhas" ? (
                <>
                    <td>{dados.horas}</td>
                    <td>{dados.funcao}</td>
                </>
            ) : (
                <>
                    <td>{dados.idade} anos</td>
                    <td>{dados.tratamento}</td></>
            )}
            <td>
                {dados.data}
            </td>
            <td>
                <span className={`status ${dados.status.toLowerCase()}`}>
                    {dados.status}</span>
            </td>

            <td className="acoes">
                <button className="acao">Ver</button>
                <button className="acao">Excluir</button>
            </td>
        </tr>
    );
}
export default LinhaTabela;