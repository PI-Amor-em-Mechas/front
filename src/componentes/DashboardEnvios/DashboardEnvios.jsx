import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import RankingRegioes from "../RankingRegioes/RankingRegioes";
import { listarKits } from "../../services/dashboardService";
import "../DashboardMadrinhas/DashboardMadrinhas.css";
import "./DashboardEnvios.css";

function DashboardEnvios({ irParaFormulario, irParaMadrinhas, irParaPacientes, sair }) {
    const [kits, setKits] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarKits()
            .then((dados) => { if (ativo) setKits(dados); })
            .catch((error_) => {
                if (ativo) setErro(error_.response?.data?.mensagem ?? "Não foi possível carregar os kits.");
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const pacientesAtendidos = new Set(kits.map((kit) => kit.pacienteId ?? kit.paciente?.id).filter(Boolean)).size;
    const cards = [
        { titulo: "Kits cadastrados", valor: kits.length, descricao: "Total retornado pela API" },
        { titulo: "Pacientes com kit", valor: pacientesAtendidos, descricao: "Pacientes vinculados a kits" },
        { titulo: "Status de entrega", valor: "Indisponível", descricao: "Não informado pela API" },
    ];

    return (
        <div className="app">
            <Navbar irParaFormulario={irParaFormulario} irParaMadrinhas={irParaMadrinhas} irParaPacientes={irParaPacientes} pagina="envios" sair={sair} />
            <main className="conteudo conteudoEnvios">
                <section className="resumoEnvios">
                    <div className="resumoPrincipal">
                        <Header titulo="Dashboard de Envios" descricao="Acompanhe os kits cadastrados" mostrarBotao={false} />
                        <section className="cards">
                            {cards.map((card) => <CardInfo key={card.titulo} {...card} />)}
                        </section>
                    </div>
                    <RankingRegioes kits={kits} />
                </section>
                {carregando && <p>Carregando kits...</p>}
                {erro && <p role="alert">{erro}</p>}
            </main>
        </div>
    );
}

export default DashboardEnvios;
