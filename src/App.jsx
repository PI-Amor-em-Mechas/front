import { useState } from "react";
import FormularioPeruca from "./componentes/Formulario/FormularioPeruca";
import DashboardMadrinhas from "./componentes/DashboardMadrinhas/DashboardMadrinhas";

function App() {

  const [pagina, setPagina] = useState("formulario");

  return (
    <div>
      {pagina === "formulario" ? (
        <FormularioPeruca irParaDashboard={() => setPagina("dashboard")} />
      ) : (
        <DashboardMadrinhas irParaFormulario={() => setPagina("formulario")}/>
      )}
    </div>
  );
}
export default App;