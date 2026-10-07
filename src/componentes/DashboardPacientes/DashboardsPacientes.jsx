import { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";
import "./DashboardsPacientes.css";
import RankingRegioes from "../RankingRegioes/RankingRegioes";

function DashboardPacientes({
    irParaFormulario,
    irParaEnvios,
    irParaMadrinhas
}) {
    const [pacientes, setPacientes] = useState([
        {
            id: 1248,
            nome: "Maria Silva Santos",
            email: "maria.silva@email.com",
            idade: 42,
            tratamento: "Quimioterapia",
            data: "15 Jan 2025",
            status: "Enviando"
        },
        {
            id: 1247,
            nome: "Ana Paula Costa",
            email: "ana.costa@email.com",
            idade: 38,
            tratamento: "Radioterapia",
            data: "14 Jan 2025",
            status: "Pendente"
        },
        {
            id: 1246,
            nome: "Juliana Oliveira",
            email: "juliana.o@email.com",
            idade: 51,
            tratamento: "Hormonoterapia",
            data: "13 Jan 2025",
            status: "Cancelado"
        },
        {
            id: 1245,
            nome: "Carla Mendes Lima",
            email: "carla.mendes@email.com",
            idade: 45,
            tratamento: "Alopecia",
            data: "12 Jan 2025",
            status: "Pendente"
        },
        {
            id: 1244,
            nome: "Patricia Rodrigues",
            email: "patricia.r@email.com",
            idade: 36,
            tratamento: "Quimioterapia",
            data: "11 Jan 2025",
            status: "Entregue"
        },
        {
            id: 1243,
            nome: "Fernanda Alves",
            email: "fernanda.a@email.com",
            idade: 48,
            tratamento: "Radioterapia",
            data: "10 Jan 2025",
            status: "Entregue"
        }
    ]);
    return (
        <div className="app">
            <Navbar
                irParaFormulario={irParaFormulario}
                irParaEnvios={irParaEnvios}
                irParaMadrinhas={irParaMadrinhas}
                pagina="pacientes"/>

            <main className="conteudo">
                <section className="resumoPacientes">
                    <div className="resumoPrincipalPacientes">
                        <Header
                            titulo="Gerenciamento de Formulários"
                            descricao="Visualize e gerencie os dados das pacientes cadastradas"
                            mostrarBotao={false}/>

                        <section className="cards">
                            <CardInfo
                                titulo="Kits do amor doados"
                                valor="8808"
                                descricao="No último mês"/>

                            <CardInfo
                                titulo="Taxa de pacientes do SUS"
                                valor="70%"
                                descricao="30% de pacientes por convênio"/>

                            <CardInfo
                                titulo="Tipo de tratamento mais recorrente"
                                valor="Quimioterapia"
                                descricao="65% das pacientes"/>
                        </section>
                    </div>
                    <RankingRegioes
                        titulo="Regiões com mais solicitações"/>
                </section>
                <Filtros tipo="pacientes" />
                <Tabela
                    dados={pacientes}
                    tipo="pacientes"/>
            </main>
        </div>
    );
}
export default DashboardPacientes;