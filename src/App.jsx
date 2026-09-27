
import { useState } from "react";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";
import DashboardEnvios from "./componentes/DashboardEnvios/DashboardEnvios";

function App() {

    const [pagina, setPagina] = useState("formulario");

    return (
        <div>
            {pagina === "formulario" && (
                <FormularioPeruca irParaDashboard={() => setPagina("madrinhas")}/>
            )}

            {pagina === "madrinhas" && (
                <DashboardMadrinhas irParaFormulario={
                  () => setPagina("formulario")} irParaEnvios={
                    () => setPagina("envios")}/>
            )}

            {pagina === "envios" && (
                <DashboardEnvios irParaFormulario={
                  () => setPagina("formulario")}irParaMadrinhas={
                    () => setPagina("madrinhas")} />
            )}
        </div>
    );
}
export default App;