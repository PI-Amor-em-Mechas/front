import { useState } from "react";

import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";
import DashboardPacientes from "./componentes/DashboardPacientes/DashboardsPacientes"
function App() {
    const [pagina, setPagina] = useState("formulario");

    return (
        <div>
            {pagina === "formulario" && (
                <FormularioPeruca
                    irParaDashboard={() => setPagina("madrinhas")}/>
            )}

            {pagina === "madrinhas" && (
                <DashboardMadrinhas
                    irParaFormulario={() => setPagina("formulario")}
                    irParaEnvios={() => setPagina("envios")}
                    irParaPacientes={() => setPagina("pacientes")}/>
            )}

            {pagina === "envios" && (
                <DashboardEnvios
                    irParaFormulario={() => setPagina("formulario")}
                    irParaMadrinhas={() => setPagina("madrinhas")}
                    irParaPacientes={() => setPagina("pacientes")}/>
            )}

            {pagina === "pacientes" && (
                <DashboardPacientes
                    irParaFormulario={() => setPagina("formulario")}
                    irParaEnvios={() => setPagina("envios")}
                    irParaMadrinhas={() => setPagina("madrinhas")}/>
            )}
        </div>
    );
}
export default App;