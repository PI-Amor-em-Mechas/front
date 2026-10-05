
import { useEffect, useState } from "react";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";
import DashboardPacientes from "./componentes/DashboardPacientes/DashboardPacientes";
import LoginInterno from "./componentes/LoginInterno/LoginInterno";
import { estaAutenticado, sair } from "./services/authService";

function App() {
    const [pagina, setPagina] = useState("formulario");
    const [autenticado, setAutenticado] = useState(estaAutenticado);

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

    if (pagina !== "formulario" && !autenticado) {
        return <LoginInterno aoEntrar={() => setAutenticado(true)} />;
    }

    return (
        <div>
            {pagina === "formulario" && (
                <FormularioPeruca irParaDashboard={() => setPagina("madrinhas")}/>
            )}

                        {pagina === "madrinhas" && (
                                <DashboardMadrinhas irParaFormulario={() => setPagina("formulario")}
                                    irParaEnvios={() => setPagina("envios")}
                                    irParaPacientes={() => setPagina("pacientes")}
                                    sair={encerrarSessao} />
            )}

            {pagina === "envios" && (
                                <DashboardEnvios irParaFormulario={() => setPagina("formulario")}
                                    irParaMadrinhas={() => setPagina("madrinhas")}
                                    irParaPacientes={() => setPagina("pacientes")}
                                    sair={encerrarSessao} />
            )}

                        {pagina === "pacientes" && (
                                <DashboardPacientes irParaFormulario={() => setPagina("formulario")}
                                    irParaMadrinhas={() => setPagina("madrinhas")}
                                    irParaEnvios={() => setPagina("envios")}
                                    sair={encerrarSessao} />
                        )}
        </div>
    );
}
export default App;