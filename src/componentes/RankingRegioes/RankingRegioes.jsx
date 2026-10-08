
import "./RankingRegioes.css";

function RankingRegioes({ kits = [] }) {
    const porEstado = kits.reduce((totais, kit) => {
        const estado = kit.paciente?.endereco?.estado || "Não informado";
        totais[estado] = (totais[estado] ?? 0) + 1;
        return totais;
    }, {});
    const regioes = Object.entries(porEstado)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);
    const maiorTotal = Math.max(1, ...regioes.map((regiao) => regiao.total));

    return (
        <section className="regioes">
            <h2>Regiões com mais kits cadastrados</h2>
            <h2>Regiões com mais kits cadastrados</h2>

            {regioes.map((regiao, indice) => (
                <div className="itemRegiao" key={regiao.nome}>
                    <div className="informacoesRegiao">
                        <span>
                            {indice + 1}. {regiao.nome}
                        </span>

                        <span>
                            {regiao.total} kits</span>
                    </div>
                    <div className="fundoBarraRegiao">
                        <div
                            className="barraRegiao"
                            style={{width: `${regiao.total / maiorTotal * 100}%` }}/>
                    </div>
                </div>))}
            {regioes.length === 0 && <p>Nenhum kit cadastrado.</p>}
        </section>
    );
}
export default RankingRegioes;