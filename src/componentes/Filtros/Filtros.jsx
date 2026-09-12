import "./Filtros.css";

function Filtros() {

    return (
        <div className="caixaFiltros">
            <div className="filtros">
                <input type="text" placeholder="Buscar por nome ou ID..."/>

                <select>
                    <option>Todos os Status</option>
                    <option value="ativa">Ativa</option>
                    <option value="afastada">Afastada</option>
                    <option value="desassociada">Desassociada</option>
                </select>

                <input type="number" placeholder="Buscar por quantidade de horas..." />

                <select>
                    <option>Data de Entradas</option>
                    <option value="12">Dezembro | 2026</option>
                    <option value="11">Novembro | 2026</option>
                    <option value="10">Outubro | 2026</option>
                    <option value="9">Setembro | 2026</option>
                    <option value="8">Agosto | 2026</option>
                    <option value="7">Julho | 2026</option>
                    <option value="6">Junho | 2026</option>
                    <option value="5">Maio | 2026</option>
                    <option value="4">Abril | 2026</option>
                    <option value="3">Março | 2026</option>
                    <option value="2">Fevereiro | 2026</option>
                    <option value="1">Janeiro | 2026</option>
                </select>
            </div>
        </div>
    )
}
export default Filtros;