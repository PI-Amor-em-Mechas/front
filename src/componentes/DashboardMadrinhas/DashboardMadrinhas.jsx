import { useState } from "react";

import "./DashboardMadrinhas.css";

import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";
import CadastroMadrinha from "../CadastroMadrinha/CadastroMadrinha";

function DashboardMadrinhas({
    irParaFormulario,
    irParaEnvios,
    irParaPacientes
}) {

    const [mostrarModal, setMostrarModal] = useState(false);

    const madrinhas = [
        {
            id: 6,
            nome: "Marcela Borges",
            email: "marcela@email.com",
            horas: "200 horas",
            funcao: "Montagem dos Kits",
            data: "29 Novembro 2024",
            status: "Ativa"
        },
        {
            id: 5,
            nome: "Anna Clara Mattos",
            email: "anna@email.com",
            horas: "160 horas",
            funcao: "Reciclagem de bijuterias",
            data: "14 Ago 2024",
            status: "Afastada"
        },
        {
            id: 4,
            nome: "Verenna Cortez",
            email: "verena@email.com",
            horas: "120 horas",
            funcao: "Montagem dos Kits",
            data: "13 Jan 2022",
            status: "Ativa"
        },
        {
            id: 3,
            nome: "Larissa Menezes",
            email: "larissa@email.com",
            horas: "100 horas",
            funcao: "Inativa",
            data: "02 Mar 2021",
            status: "Desassociada"
        },
        {
            id: 2,
            nome: "Giovanna Oliveira",
            email: "gioliveira@email.com",
            horas: "150 horas",
            funcao: "Reciclagem de bijuterias",
            data: "28 Maio 2019",
            status: "Ativa"
        },
        {
            id: 1,
            nome: "Tatiane Prado",
            email: "pradotati@email.com",
            horas: "240 horas",
            funcao: "Reciclagem de bijuterias",
            data: "29 Janeiro 2019",
            status: "Ativa"
        }
    ];

    return (
        <div className="app">
            <Navbar
                irParaFormulario={irParaFormulario}
                irParaEnvios={irParaEnvios}
                irParaPacientes={irParaPacientes}
                pagina="madrinhas"/>

            <main className="conteudo">
                <Header
                    titulo="Gerenciamento de Madrinhas"
                    descricao="Visualize e gerencie os dados das madrinhas cadastradas"
                    mostrarBotao={true}
                    textoBotao="Cadastrar Madrinha"
                    abrirModal={() => setMostrarModal(true)}/>

                <section className="cards">

                    <CardInfo
                        titulo="Total Madrinhas"
                        valor="6"
                        descricao="Madrinhas cadastradas"/>

                    <CardInfo
                        titulo="Madrinha com Mais Horas"
                        valor="Tatiane Prado"
                        descricao="240 horas"/>

                    <CardInfo
                        titulo="Total Horas Voluntárias"
                        valor="960"
                        descricao="Horas realizadas"/>

                    <CardInfo
                        titulo="Amorímetro"
                        valor="9401"
                        descricao="Perucas a caminho"/>
                </section>
                <Filtros />
                <Tabela
                    dados={madrinhas}
                    tipo="madrinhas"/>
            </main>
            {mostrarModal && (
                <CadastroMadrinha
                    fecharModal={() => setMostrarModal(false)}/>
            )}
        </div>
    );
}
export default DashboardMadrinhas;