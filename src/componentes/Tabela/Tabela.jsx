import "./Tabela.css";
import LinhaTabela from "../LinhaTabela/LinhaTabela";

function Tabela() {
    const madrinhas = [
        {
            id:6,
            nome:"Marcela Borges",
            email:"marcela@email.com",
            horas:"200 horas",
            funcao:"Montagem dos Kits",
            data:"29 Novembro 2024",
            status:"Ativa"
        },
        {
            id:5,
            nome:"Anna Clara Mattos",
            email:"anna@email.com",
            horas:"160 horas",
            funcao:"Reciclagem de bijuterias",
            data:"14 Ago 2024",
            status:"Afastada"
        },
        {
            id:4,
            nome:"Verenna Cortez",
            email:"verena@email.com",
            horas:"120 horas",
            funcao:"Montagem dos Kits",
            data:"13 Jan 2022",
            status:"Ativa"
        },
        {
            id:3,
            nome:"Larissa Menezes",
            email:"larissa@email.com",
            horas:"100 horas",
            funcao:"Inativa",
            data:"02 Mar 2021",
            status:"Desassociada"
        },
        {
            id:2,
            nome:"Giovanna Oliveira",
            email:"gioliveira@email.com",
            horas:"150 horas",
            funcao:"Reciclagem de bijuterias",
            data:"28 Maio 2019",
            status:"Ativa"
        },
        {
            id:1,
            nome:"Tatiane Prado",
            email:"pradotati@email.com",
            horas:"240 horas",
            funcao:"Reciclagem de bijuterias",
            data:"29 Janeiro 2019",
            status:"Ativa"
        }
    ];
    return (
        <div className="containerTabela">
            <div className="tabela">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Voluntária</th>
                            <th>Horas Voluntárias</th>
                            <th>Função</th>
                            <th>Data Cadastro</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {madrinhas.map((m) => (<LinhaTabela
                                id={m.id}
                                nome={m.nome}
                                email={m.email}
                                horas={m.horas}
                                funcao={m.funcao}
                                data={m.data}
                                status={m.status}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default Tabela;