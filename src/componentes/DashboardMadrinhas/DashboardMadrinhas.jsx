import { useState } from "react";
import "./DashboardMadrinhas.css";

import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";
import CadastroMadrinha from "../CadastroMadrinha/CadastroMadrinha";

function DashboardMadrinhas({irParaFormulario}) {
  const [mostrarModal, setMostrarModal] = useState(false)
  
  const cards = [
    {
      titulo: "Total de Madrinhas",
      valor: "6",
      descricao: ""
    },
    {
      titulo: "Madrinha com Mais Horas",
      valor: "Tatiane Prado",
      descricao: "240 horas"
    },
    {
      titulo: "Total de Horas Voluntárias",
      valor: "960 horas",
      descricao: ""
    },
    {
      titulo: "Amorímetro",
      valor: "9401",
      descricao: "Perucas a caminho"
    }
  ];

  return (
    <div className="app">
      <Navbar irParaFormulario={irParaFormulario}/>

      <main className="conteudo">
        <Header abrirModal={() => setMostrarModal(true)}/>

        <section className="cards">
          {cards.map((card) => (
            <CardInfo
              titulo={card.titulo}
              valor={card.valor}
              descricao={card.descricao}
            />
          ))}
        </section>

        <Filtros />

        <Tabela />
      </main>
      {
        mostrarModal && <CadastroMadrinha fecharModal={() => setMostrarModal(false)}/>
      }
    </div>
  );
}

export default DashboardMadrinhas;