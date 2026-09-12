import "./CardInfo.css";

function CardInfo({titulo, valor, descricao}){

    return(
        <div className="card">
            <h3>{titulo}</h3>
            <h2>{valor}</h2>
            <p>{descricao}</p>
        </div>
    )
}
export default CardInfo;