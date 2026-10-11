import { useEffect, useState } from "react";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";
import DashboardPacientes from "./componentes/DashboardPacientes/DashboardPacientes";
import LoginInterno from "./componentes/LoginInterno/LoginInterno";
import RevisaoDocumentos from "./componentes/RevisaoDocumentos/RevisaoDocumentos";
import { estaAutenticado, sair } from "./services/authService";

function App() {
    const [pagina, setPagina] = useState("formulario");
    const [autenticado, setAutenticado] = useState(estaAutenticado);
    const [sessaoExpirada, setSessaoExpirada] = useState(false);

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
        <div>
            {sessaoExpirada && <p role="alert">Sessão expirada. Entre novamente na Área da equipe para continuar.</p>}
            <div hidden={pagina !== "formulario"}>
                <FormularioPeruca
                    ativo={pagina === "formulario" && !sessaoExpirada}
                    irParaDashboard={() => setPagina("madrinhas")}/>
            </div>
            {pagina !== "formulario" && !autenticado && <LoginInterno aoEntrar={() => { setAutenticado(true); setSessaoExpirada(false); }} />}

            {pagina === "madrinhas" && autenticado && (
                <DashboardMadrinhas
                    irParaFormulario={() => setPagina("formulario")}
                    irParaEnvios={() => setPagina("envios")}
                    irParaPacientes={() => setPagina("pacientes")}
                    irParaDocumentos={() => setPagina("documentos")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "envios" && autenticado && (
                <DashboardEnvios
                    irParaFormulario={() => setPagina("formulario")}
                    irParaMadrinhas={() => setPagina("madrinhas")}
                    irParaPacientes={() => setPagina("pacientes")}
                    irParaDocumentos={() => setPagina("documentos")}
                    sair={encerrarSessao}
                />
            )}

            {pagina === "pacientes" && autenticado && (
                <DashboardPacientes
                    irParaFormulario={() => setPagina("formulario")}
                    irParaEnvios={() => setPagina("envios")}
                    irParaMadrinhas={() => setPagina("madrinhas")}
                    irParaDocumentos={() => setPagina("documentos")}
                    sair={encerrarSessao}
                />
            )}
            {pagina === "documentos" && autenticado && <RevisaoDocumentos
                irParaFormulario={() => setPagina("formulario")}
                irParaEnvios={() => setPagina("envios")}
                irParaPacientes={() => setPagina("pacientes")}
                irParaMadrinhas={() => setPagina("madrinhas")}
                irParaDocumentos={() => setPagina("documentos")}
                sair={encerrarSessao}
            />}
        </div>
    );
}
export default App;