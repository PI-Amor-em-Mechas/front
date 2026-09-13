import "./DashboardMadrinhas.css";

import Navbar from "../Navbar/Navbar";
import Header from "../Header/Header";
import CardInfo from "../CardInfo/CardInfo";
import Filtros from "../Filtros/Filtros";
import Tabela from "../Tabela/Tabela";

function DashboardMadrinhas({irParaFormulario}) {
  const cards = [
    {
      titulo: "Total de Madrinhas",
      valor: "42",
      descricao: ""
    },
    {
      titulo: "Madrinha com Mais Horas",
      valor: "Marcela Borges",
      descricao: "200 horas"
    },
    {
      titulo: "Total de Horas Voluntárias",
      valor: "3.429",
      descricao: "No período de 1 ano"
    },
    {
      titulo: "Amorímetro",
      valor: "8.245",
      descricao: "Peruca a caminho"
    }
  ];

  return (
    <div className="app">
      <Navbar irParaFormulario={irParaFormulario}/>

      <main className="conteudo">
        <Header />

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
    </div>
  );
}

export default DashboardMadrinhas;