import "./Header.css";

function Header(){
    
    return(
        <header className="header">
            <div>
                <h1>Madrinhas do Amor</h1>
                <p>Gestão de horas das madrinhas do amor</p>
            </div>
            <button className="cadastrar">Cadastrar Madrinha</button>
        </header>
    )
}
export default Header;