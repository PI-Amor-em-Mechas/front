
import "./Header.css";

function Header({titulo = "Madrinhas do Amor", descricao = "Gestão de horas das madrinhas do amor", 
    mostrarBotao = true, abrirModal}) {

    return (
        <header className="header">

            <div>
                <h1>{titulo}</h1>
                <p>{descricao}</p>
            </div>

            {mostrarBotao && (<button className="cadastrar"
                    onClick={abrirModal}>Cadastrar Madrinha</button>)}
        </header>
    );
}
export default Header;