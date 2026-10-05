
import "./Navbar.css";

import logo from "../../assets/logo.png";
import perfil from "../../assets/perfil.png";

function Navbar({irParaFormulario, irParaEnvios, irParaMadrinhas, irParaPacientes, pagina, sair}) {

    return (
        <nav className="navbar">
            <div className="ladoEsquerdo">
                <button type="button" className="logoBotao" aria-label="Voltar ao formulário" onClick={irParaFormulario}>
                    <img src={logo} alt="" className="logo" />
                </button>
            </div>

            <div className="menu">

                <button type="button" className={pagina === "envios" ? "ativo" : ""}
                    aria-current={pagina === "envios" ? "page" : undefined} onClick={irParaEnvios}>Painel</button>
                <button type="button" className={pagina === "pacientes" ? "ativo" : ""}
                    aria-current={pagina === "pacientes" ? "page" : undefined} onClick={irParaPacientes}>Pacientes</button>
                <button type="button" className={pagina === "madrinhas" ? "ativo" : ""}
                    aria-current={pagina === "madrinhas" ? "page" : undefined} onClick={irParaMadrinhas}>Madrinhas</button>
            </div>

            <div className="ladoDireito">
                <button className="btnExportar" onClick={sair}>Sair</button>

                <img src={perfil} alt="Perfil" className="perfil"/>
            </div>
        </nav>
    );
}
export default Navbar;