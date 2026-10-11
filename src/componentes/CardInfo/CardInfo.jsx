import "./CardInfo.css";

function CardInfo({titulo, valor, descricao, icone}){

    return(
        <div className={`card ${icone ? "cardComIcone" : ""}`}>
            <h3>{titulo}</h3>
            <h2>{valor}</h2>
            <p>{descricao}</p>
            {icone && <span className="iconeCardInfo" aria-hidden="true">{icone}</span>}
        </div>
    )
}
export default CardInfo;