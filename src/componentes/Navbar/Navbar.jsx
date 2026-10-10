
import "./Navbar.css";

import logo from "../../assets/logo.png";
import perfil from "../../assets/perfil.png";
import { podeRevisarDocumentos } from "../../services/authService";

function Navbar({irParaFormulario, irParaEnvios, irParaMadrinhas, irParaPacientes, irParaDocumentos, pagina, sair}) {

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
                {podeRevisarDocumentos() && irParaDocumentos && <button type="button" className={pagina === "documentos" ? "ativo" : ""}
                    aria-current={pagina === "documentos" ? "page" : undefined} onClick={irParaDocumentos}>Documentos</button>}
            </div>

            <div className="ladoDireito">
                {sair && <button type="button" className="btnExportar" onClick={sair}>Sair</button>}

                <img src={perfil} alt="Perfil" className="perfil"/>
            </div>
        </nav>
    );
}
export default Navbar;