
import "./RankingRegioes.css";

function RankingRegioes({ kits, titulo, por = "estado", carregando = false }) {
    const regioesDemonstracao = [
        { nome: "São Paulo", total: 1000 },
        { nome: "Rio de Janeiro", total: 500 },
        { nome: "Ceará", total: 400 },
        { nome: "Cuiabá", total: 247 },
        { nome: "Amazonas", total: 100 },
    ];
    const porLocalidade = (kits ?? []).reduce((totais, kit) => {
        const endereco = kit.paciente?.endereco;
        const localidade = por === "cidade"
            ? endereco?.cidade || "Não informado"
            : endereco?.estado || "Não informado";
        totais[localidade] = (totais[localidade] ?? 0) + 1;
        return totais;
    }, {});
    const regioes = kits === undefined
        ? regioesDemonstracao
        : Object.entries(porLocalidade)
            .map(([nome, total]) => ({ nome, total }))
            .sort((a, b) => b.total - a.total);
    const maiorTotal = Math.max(1, ...regioes.map((regiao) => regiao.total));
    const tituloRanking = titulo ?? (kits === undefined
        ? "Regiões com mais kits entregues"
        : `Regiões com mais kits cadastrados por ${por}`);

    return (
        <section className="regioes">
            <h2>{tituloRanking}</h2>

            {regioes.map((regiao, indice) => (
                <div className="itemRegiao" key={regiao.nome}>
                    <div className="informacoesRegiao">
                        <span>
                            {indice + 1}. {regiao.nome}
                        </span>

                        <span>
                            {kits === undefined
                                ? `${regiao.total === 1000 ? "1 mil" : regiao.total} Doações`
                                : `${regiao.total} kits`}</span>
                    </div>
                    <div className="fundoBarraRegiao">
                        <div
                            className="barraRegiao"
                            style={{width: `${regiao.total / maiorTotal * 100}%` }}/>
                    </div>
                </div>))}
            {carregando && <p>Carregando kits...</p>}
            {!carregando && regioes.length === 0 && <p>Nenhum kit cadastrado.</p>}
        </section>
    );
}
export default RankingRegioes;