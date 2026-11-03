import { useEffect, useState } from "react";
import "./App.css";
import SiteOng from "./componentes/SiteOng/SiteOng";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";
import DashboardPacientes from "./componentes/DashboardPacientes/DashboardPacientes";
import LoginInterno from "./componentes/LoginInterno/LoginInterno";
import { estaAutenticado, sair } from "./services/authService";

function App() {
    // A tela inicial é a simulação do site da ONG
    const [pagina, setPagina] = useState("site");
    const [saindo, setSaindo] = useState(false);
    const [autenticado, setAutenticado] = useState(estaAutenticado);

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

    // "site" e "formulario" são públicos; o resto exige login
    if (pagina !== "site" && pagina !== "formulario" && !autenticado) {
        return <LoginInterno aoEntrar={() => setAutenticado(true)} />;
    }

    return (
        <div key={pagina} className={saindo ? "tela saindo" : "tela"}>
            {pagina === "site" && (
                <SiteOng irParaFormulario={() => irPara("formulario")} />
            )}

            {pagina === "formulario" && (
                <>
                    <FormularioPeruca
                        irParaDashboard={() => irPara("madrinhas")}/>

                    <button type="button" className="btnVoltarSite" onClick={() => irPara("site")}>
                        ← Voltar ao site da ONG
                    </button>
                </>
            )}

            {pagina === "madrinhas" && (
                <DashboardMadrinhas
                    irParaFormulario={() => irPara("formulario")}
                    irParaEnvios={() => irPara("envios")}
                    irParaPacientes={() => irPara("pacientes")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "envios" && (
                <DashboardEnvios
                    irParaFormulario={() => irPara("formulario")}
                    irParaMadrinhas={() => irPara("madrinhas")}
                    irParaPacientes={() => irPara("pacientes")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "pacientes" && (
                <DashboardPacientes
                    irParaFormulario={() => irPara("formulario")}
                    irParaEnvios={() => irPara("envios")}
                    irParaMadrinhas={() => irPara("madrinhas")}
                    sair={encerrarSessao}
                />
            )}
        </div>
    );
}
export default App;