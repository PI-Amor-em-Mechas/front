import "./Filtros.css";
function Filtros({ tipo }) {

    return (
        <div className="caixaFiltros">
            <div className="filtros">

                <input
                    type="text"
                    placeholder="Buscar por nome ou ID..."/>

                {tipo === "madrinhas" ? (
                    <>
                        <select>
                            <option>Todos os Status</option>
                            <option value="ativa">Ativa</option>
                            <option value="afastada">Afastada</option>
                            <option value="desassociada">Desassociada</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Buscar por quantidade de horas..."
                        />

                        <input type="date"/>
                    </>
                ) : (
                    <>
                        <select>
                            <option>Todos os Status</option>
                            <option value="enviando">Enviando</option>
                            <option value="pendente">Pendente</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="entregue">Entregue</option>
                        </select>

                        <select>
                            <option>Todos os Tratamentos</option>
                            <option value="quimioterapia">Quimioterapia</option>
                            <option value="radioterapia">Radioterapia</option>
                            <option value="hormonoterapia">Hormonoterapia</option>
                            <option value="alopecia">Alopecia</option>
                        </select>

                        <input type="date"/>
                    </>
                )}
            </div>
        </div>
    );
}
export default Filtros;