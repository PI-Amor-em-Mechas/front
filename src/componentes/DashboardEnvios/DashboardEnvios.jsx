
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Tabela from "../Tabela/Tabela";
import RankingRegioes from "../../RankingRegioes/RankingRegioes";

import "../DashboardMadrinhas/DashboardMadrinhas.css";
import "./DashboardEnvios.css";

function DashboardEnvios({ irParaFormulario, irParaMadrinhas }) {

    const cards = [
        {
            titulo: "Total de Envios",
            valor: "130",
            descricao: "No último mês"
        },
        {
            titulo: "Entregues",
            valor: "110",
            descricao: "No último mês"
        },
        {
            titulo: "Em Trânsito",
            valor: "20",
            descricao: "No último mês"
        }
    ];

    return (
        <div className="app">
            <Navbar irParaFormulario={irParaFormulario} irParaMadrinhas={irParaMadrinhas}pagina="envios"/>

            <main className="conteudo conteudoEnvios">
                <section className="resumoEnvios">
                    <div className="resumoPrincipal">

                        <Header titulo="Dashboard de Envios" descricao="Acompanhe os dados de envio de perucas em tempo real"
                        mostrarBotao={false}/>

                        <section className="cards">
                            {cards.map((card) => (<CardInfo key={card.titulo}
                                    titulo={card.titulo}
                                    valor={card.valor}
                                    descricao={card.descricao}
                                />
                            ))}
                        </section>
                    </div>
                    <RankingRegioes />
                </section>
                <section className="graficosEnvios"></section>
            </main>
        </div>
    );
}
export default DashboardEnvios;