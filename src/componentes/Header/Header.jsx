import "./Header.css";

function Header({abrirModal}){
    
    return(
        <header className="header">
            <div>
                <h1>Madrinhas do Amor</h1>
                <p>Gestão de horas das madrinhas do amor</p>
            </div>
            <button className="cadastrar" onClick={abrirModal}>Cadastrar Madrinha</button>
        </header>
    )
}
export default Header;