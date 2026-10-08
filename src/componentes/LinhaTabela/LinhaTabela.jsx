import "./LinhaTabela.css";

function LinhaTabela({ dados, tipo, aoEditar, aoExcluir }) {
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
                <button type="button" className="btn-editar" onClick={aoEditar}>Editar</button>
                <button type="button" className="btn-excluir" onClick={aoExcluir}>Excluir</button>
            </td>
        </tr>
    );
}
export default LinhaTabela;