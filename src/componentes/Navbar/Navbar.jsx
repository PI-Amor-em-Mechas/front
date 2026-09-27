
import "./Navbar.css";

import logo from "../../assets/logo.png";
import perfil from "../../assets/perfil.png";

function Navbar({irParaFormulario, irParaEnvios, irParaMadrinhas, pagina}) {

    return (
        <nav className="navbar">
            <div className="ladoEsquerdo">
                <img src={logo} alt="Logo" className="logo" onClick={irParaFormulario}/>
            </div>

            <div className="menu">

                <a className={pagina === "envios" ? "ativo" : ""}
                    onClick={irParaEnvios}>Painel</a> <a>Pacientes</a>

                <a className={pagina === "madrinhas" ? "ativo" : ""}
                    onClick={irParaMadrinhas} >Madrinhas</a>
            </div>

            <div className="ladoDireito">
                <button className="btnExportar">Exportar Dados</button>

                <img src={perfil} alt="Perfil" className="perfil"/>
            </div>
        </nav>
    );
}
export default Navbar;