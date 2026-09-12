import "./LinhaTabela.css";

function LinhaTabela({
    id,
    nome,
    email,
    horas,
    funcao,
    data,
    status
}){
    return(
        <tr>
            <td>#{id}</td>
            <td>
                <strong>{nome}</strong>
                <br />
                <span>{email}</span>
            </td>
            <td>{horas}</td>
            <td>{funcao}</td>
            <td>{data}</td>
            <td>
                <span className={status === "Ativa" ? "ativa" : status === "Afastada" ? "afastada" : "desassociada"}>{status}</span>
            </td>
            <td>
                ⋮
            </td>
        </tr>
    )
}
export default LinhaTabela;