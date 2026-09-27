
import "./RankingRegioes.css";

function RankingRegioes() {

    const regioes = [
        { nome: "São Paulo", total: 1000 },
        { nome: "Rio de Janeiro", total: 500 },
        { nome: "Ceará", total: 400 },
        { nome: "Cuiabá", total: 247 },
        { nome: "Amazonas", total: 100 }
    ];

    return (
        <section className="regioes">
            <h2>Regiões com mais kits entregues</h2>

            {regioes.map((regiao, indice) => (
                <div className="itemRegiao" key={regiao.nome}>
                    <div className="informacoesRegiao">
                        <span>
                            {indice + 1}. {regiao.nome}
                        </span>

                        <span>
                            {regiao.total === 1000 ? "1 mil"
                                : regiao.total} Doações</span>
                    </div>
                    <div className="fundoBarraRegiao">
                        <div
                            className="barraRegiao"
                            style={{width: `${regiao.total / 1000 * 100}%` }}/>
                    </div>
                </div>))}
        </section>
    );
}
export default RankingRegioes;