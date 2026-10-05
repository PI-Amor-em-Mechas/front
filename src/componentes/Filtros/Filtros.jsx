import "./Filtros.css";

function Filtros({ filtros, aoAlterar }) {
    function alterar(campo, valor) {
        aoAlterar((atual) => ({ ...atual, [campo]: valor }));
    }

    return (
        <div className="caixaFiltros">
            <div className="filtros">
                <input type="search" placeholder="Buscar por nome ou ID..." value={filtros.busca}
                    onChange={(evento) => alterar("busca", evento.target.value)}/>

                <select value={filtros.status} onChange={(evento) => alterar("status", evento.target.value)}>
                    <option value="">Todos os Status</option>
                    <option value="ativa">Ativa</option>
                    <option value="afastada">Afastada</option>
                    <option value="desassociada">Desassociada</option>
                </select>

                <input type="number" min="0" placeholder="Horas mínimas..." value={filtros.horas}
                    onChange={(evento) => alterar("horas", evento.target.value)} />

                <input type="month" aria-label="Filtrar por mês de cadastro" value={filtros.mes}
                    onChange={(evento) => alterar("mes", evento.target.value)} />
            </div>
        </div>
    )
}
export default Filtros;