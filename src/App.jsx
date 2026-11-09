import { useEffect, useState } from "react";
import "./App.css";
import SiteOng from "./componentes/SiteOng/SiteOng";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";
import DashboardPacientes from "./componentes/DashboardPacientes/DashboardPacientes";
import LoginInterno from "./componentes/LoginInterno/LoginInterno";
import RevisaoDocumentos from "./componentes/RevisaoDocumentos/RevisaoDocumentos";
import { estaAutenticado, sair } from "./services/authService";

function App() {
    // A tela inicial é a simulação do site da ONG
    const [pagina, setPagina] = useState("site");
    const [saindo, setSaindo] = useState(false);
    const [autenticado, setAutenticado] = useState(estaAutenticado);
    const [sessaoExpirada, setSessaoExpirada] = useState(false);

    // Troca de tela com transição: a tela atual some e a nova entra
    function irPara(destino) {
        setSaindo(true);
        setTimeout(() => {
            setPagina(destino);
            setSaindo(false);
            window.scrollTo(0, 0);
        }, 300);
    }

    useEffect(() => {
        function sessaoExpirada() {
            setSessaoExpirada(true);
            setAutenticado(false);
            setPagina("formulario");
        }

        window.addEventListener("auth-expired", sessaoExpirada);
        return () => window.removeEventListener("auth-expired", sessaoExpirada);
    }, []);

    function encerrarSessao() {
        sair();
        setAutenticado(false);
        setPagina("formulario");
    }

    return (
        <div className={saindo ? "tela saindo" : "tela"}>
            {sessaoExpirada && <p role="alert">Sessão expirada. Entre novamente na Área da equipe para continuar.</p>}
            {pagina === "site" && <SiteOng irParaFormulario={() => irPara("formulario")} />}
            <div hidden={pagina !== "formulario"}>
                <FormularioPeruca
                    ativo={pagina === "formulario" && !sessaoExpirada}
                    irParaDashboard={() => irPara("madrinhas")}/>
                <button type="button" className="btnVoltarSite" onClick={() => irPara("site")}>
                    ← Voltar ao site da ONG
                </button>
            </div>
            {pagina !== "site" && pagina !== "formulario" && !autenticado && <LoginInterno aoEntrar={() => { setAutenticado(true); setSessaoExpirada(false); }} />}

            {pagina === "madrinhas" && autenticado && (
                <DashboardMadrinhas
                    irParaFormulario={() => irPara("formulario")}
                    irParaEnvios={() => irPara("envios")}
                    irParaPacientes={() => irPara("pacientes")}
                    irParaDocumentos={() => irPara("documentos")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "envios" && autenticado && (
                <DashboardEnvios
                    irParaFormulario={() => irPara("formulario")}
                    irParaMadrinhas={() => irPara("madrinhas")}
                    irParaPacientes={() => irPara("pacientes")}
                    irParaDocumentos={() => irPara("documentos")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "pacientes" && autenticado && (
                <DashboardPacientes
                    irParaFormulario={() => irPara("formulario")}
                    irParaEnvios={() => irPara("envios")}
                    irParaMadrinhas={() => irPara("madrinhas")}
                    irParaDocumentos={() => irPara("documentos")}
                    sair={encerrarSessao}
                />
            )}
            {pagina === "documentos" && autenticado && <RevisaoDocumentos
                irParaFormulario={() => irPara("formulario")}
                irParaEnvios={() => irPara("envios")}
                irParaPacientes={() => irPara("pacientes")}
                irParaMadrinhas={() => irPara("madrinhas")}
                irParaDocumentos={() => irPara("documentos")}
                sair={encerrarSessao}
            />}
        </div>
    );
}
export default App;