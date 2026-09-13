import "./CadastroMadrinha.css";

function CadastroMadrinha({ fecharModal }) {
    return (
        <div className="fundoModal">
            <div className="modal">

                <button className="fechar" onClick={fecharModal}>×</button>
                <h1>Cadastro de Madrinha do amor</h1>
                <p>Preencha todos os campos obrigatórios para o cadastro</p>

                <div className="formularioMadrinha">

                    <label>Nome completo da Madrinha/Padrinho *<input type="text" /></label>

                    <label>Endereço de email *<input type="email" /></label>

                    <label> Data de Nascimento *<input type="date" /></label>

                    <label> Número de Telefone *<input type="tel" /></label>

                    <label>CEP *<input type="text" /></label>

                    <h2>Endereço da madrinha/padrinho</h2>

                    <label className="campoGrande">Endereço completo *<input type="text" placeholder="Rua, Avenida, etc." /></label>

                    <label>Número *<input type="text" /></label>

                    <label>Bairro *<input type="text" />
                    </label>

                    <label>Cidade *<input type="text" /></label>

                    <label>Estado *
                        <select defaultValue="">
                            <option value="">Selecione o estado</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                        </select>
                    </label>

                    <label>Complemento< input type="text" /></label>

                </div>
                <div className="botoesModal">
                    <button className="botaoVoltar"onClick={fecharModal}>Voltar</button>
                    <button className="botaoCadastrar">Cadastrar</button>
                </div>
            </div>
        </div>
    );
}
export default CadastroMadrinha;