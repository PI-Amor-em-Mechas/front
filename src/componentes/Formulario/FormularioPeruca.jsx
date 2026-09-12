import { useState } from "react";
import style from "./FormularioPeruca.module.css";
import logo from "../../assets/logo amor em mechas.png";

function IconeNuvemUpload() {
 return (
  <svg
   className={style.uploadIcone}
   viewBox="0 0 24 24"
   fill="none"
   xmlns="http://www.w3.org/2000/svg"
  >
   <path
    d="M7 18a4.5 4.5 0 0 1-.5-8.977A5.5 5.5 0 0 1 17.3 7.03 4.5 4.5 0 0 1 17 18H7Z"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
   />
   <path
    d="M12 10v7m0-7 2.5 2.5M12 10l-2.5 2.5"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
   />
  </svg>
 );
}

function FormularioPeruca() {
 const [aceitouCookies, setAceitouCookies] = useState(false);
 const [passoAtual, setPassoAtual] = useState(1);
 const [enviado, setEnviado] = useState(false);
 const [arquivoRelatorio, setArquivoRelatorio] = useState(null);
 const [arquivoCabelo, setArquivoCabelo] = useState(null);
 const totalPassos = 4;

 function aceitarCookies() {
  setAceitouCookies(true);
 }

 function avancar() {
  setPassoAtual((passo) => Math.min(passo + 1, totalPassos));
 }

 function voltar() {
  setPassoAtual((passo) => Math.max(passo - 1, 1));
 }

 function enviarFormulario() {
  setEnviado(true);
 }

 function selecionarArquivo(evento, definirArquivo) {
  const arquivo = evento.target.files[0];
  definirArquivo(arquivo ? arquivo.name : null);
 }

 function retornarAoFormulario() {
  setEnviado(false);
  setPassoAtual(1);
 }

 if (enviado) {
  return (
   <div className={style.paginaSucesso}>
    <div className={style.cardSucesso}>
     <span className={style.iconeSucesso}>✓</span>
     <h1 className={style.tituloSucesso}>
      Formulário preenchido e enviado com sucesso.
     </h1>
     <p className={style.subtituloSucesso}>Seu pedido será revisado para o envio</p>
     <button className={style.botaoAvancar} onClick={retornarAoFormulario}>
      Voltar ao início
     </button>
    </div>
   </div>
  );
 }

 return (
  <div className={style.pagina}>
   <header className={style.header}>
    <div className={style.logo}>
     <img src={logo} alt="Instituto Amor em Mechas" />
    </div>
   </header>

   <div className={style.passos}>
    {Array.from({ length: totalPassos }).map((_, indice) => {
     const numeroPasso = indice + 1;
     const classePasso =
      numeroPasso < passoAtual
       ? style.concluida
       : numeroPasso === passoAtual
        ? style.ativa
        : "";
     return <span key={numeroPasso} className={`${style.bolinha} ${classePasso}`}></span>;
    })}
   </div>

   <main className={style.conteudo}>
    <h1 className={style.titulo}>Formulário de Solicitação de Peruca</h1>
    <p className={style.subtitulo}>
     Preencha todos os campos obrigatórios para solicitar sua peruca do amor.
    </p>

    {!aceitouCookies && (
     <div className={style.avisoCookies}>
      <p>
       <strong className={style.atencao}>Atenção!</strong> Utilizamos cookies* e outras tecnologias de
       medição para melhorar a sua experiência de navegação no nosso site.
      </p>
      <p className={style.legendaCookies}>
       *Cookies de sites são pequenos arquivos de texto criados por sites que
       você visita e armazenados no seu navegador.
      </p>
      <button className={style.botaoConcordo} onClick={aceitarCookies}>
       Concordo
      </button>
     </div>
    )}

    {passoAtual === 1 && (
     <>
      <section className={style.card}>
       <h2 className={style.tituloCard}>Informações Pessoais</h2>
       <div className={style.grid}>
        <label className={style.campo}>
         Nome completo da/o Paciente *
         <input type="text" placeholder="Ex. Luciana Silva" />
        </label>
        <label className={style.campo}>
         Seu email *
         <input type="email" placeholder="Ex. luciana@email.com" />
        </label>
        <label className={style.campo}>
         Data do Nascimento *
         <input type="date" placeholder="dd/mm/aaaa" />
        </label>
        <label className={style.campo}>
         Celular *
         <input type="tel" placeholder="Ex. 11 987654321" />
        </label>
        <label className={style.campo}>
         CPF *
         <input type="text" placeholder="Ex. 123.456.789-11" />
        </label>
        <label className={style.campo}>
         CEP *
         <input type="text" placeholder="Ex. 12345-678" />
        </label>
       </div>
      </section>

      <section className={style.card}>
       <h2 className={style.tituloCard}>Endereço de Entrega</h2>
       <div className={style.grid}>
        <label className={`${style.campo} ${style.largo}`}>
         Endereço completo *
         <input type="text" placeholder="Ex. Rua, Número, Bairro, Cidade, Estado" />
        </label>
        <label className={style.campo}>
         Número *
         <input type="text" placeholder="Ex. 2500" />
        </label>
        <label className={style.campo}>
         Bairro *
         <input type="text" placeholder="Ex. Barra Funda" />
        </label>
        <label className={style.campo}>
         Cidade *
         <input type="text" placeholder="Ex. São Paulo" />
        </label>
        <label className={style.campo}>
         Estado *
         <select defaultValue="">
          <option value="" disabled>Selecione o estado</option>
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
        <label className={style.campo}>
         Complemento
         <input type="text" placeholder="Ex. Bloco B" />
        </label>
       </div>

       <div className={style.acoes}>
        <button className={style.botaoVoltar} onClick={voltar}>Voltar</button>
        <button className={style.botaoAvancar} onClick={avancar}>Avançar</button>
       </div>
      </section>
     </>
    )}

    {passoAtual === 2 && (
     <section className={style.card}>
      <h2 className={style.tituloCard}>Informações Pessoais</h2>

      <label className={style.campoSimples}>
       Estado Civil *
       <select defaultValue="">
        <option value="" disabled>Selecione seu estado civil</option>
        <option value="solteiro">Solteiro(a)</option>
        <option value="casado">Casado(a)</option>
        <option value="divorciado">Divorciado(a)</option>
        <option value="viuvo">Viúvo(a)</option>
       </select>
      </label>

      <div className={style.campoSimples}>
       Tem filhos? *
       <div className={style.radioGroup}>
        <label className={style.radioOpcao}>
         <input type="radio" name="temFilhos" value="sim" defaultChecked />
         Sim
        </label>
        <label className={style.radioOpcao}>
         <input type="radio" name="temFilhos" value="nao" />
         Não
        </label>
       </div>
      </div>

      <label className={style.campoSimples}>
       Se tem filhos, qual idade?
       <input type="text" placeholder="Ex. 10" />
      </label>

      <label className={style.campoSimples}>
       Quantas pessoas moram com você? *
       <input type="text" placeholder="Ex. 2" />
      </label>

      <div className={style.acoes}>
       <button className={style.botaoVoltar} onClick={voltar}>Voltar</button>
       <button className={style.botaoAvancar} onClick={avancar}>Avançar</button>
      </div>
     </section>
    )}

    {passoAtual === 3 && (
     <>
      <section className={style.card}>
       <h2 className={style.tituloCard}>Informações Médicas</h2>

       <div className={style.campoSimples}>
        Motivo para querer uma peruca do Amor *
        <div className={style.radioGroup}>
         <label className={style.radioOpcao}>
          <input type="radio" name="motivo" value="quimioterapico" defaultChecked />
          Tratamento quimioterápico
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="motivo" value="alopecia" />
          Alopecia Areata
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="motivo" value="outros" />
          Outros
         </label>
        </div>
       </div>

       <label className={style.campoSimples}>
        Em caso de tratamento quimioterápico, qual o tipo de câncer *
        <select defaultValue="">
         <option value="" disabled>Selecione o tipo</option>
         <option value="mama">Mama</option>
         <option value="prostata">Próstata</option>
         <option value="pulmao">Pulmão</option>
         <option value="outro">Outro</option>
        </select>
       </label>

       <label className={style.campoSimples}>
        Início das quimioterapias ou tratamento *
        <input type="date" placeholder="dd/mm/yyyy" />
       </label>

       <div className={style.campoSimples}>
        Tipo de atendimento durante o tratamento *
        <p className={style.subLabel}>
         Vale ressaltar que priorizamos a doação para pacientes em tratamento pelo SUS.
        </p>
        <div className={style.radioGroup}>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="sus" defaultChecked />
          Público - SUS
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="convenio" />
          Convênio
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="particular" />
          Particular
         </label>
        </div>
       </div>
      </section>

      <section className={style.secaoSemBorda}>
       <h2 className={style.tituloCard}>Documentos</h2>

       <div className={style.campoSimples}>
        Foto do pedido/relatório médico *
        <p className={style.subLabel}>
         Favor enviar APENAS UMA foto descrevendo o tratamento
        </p>
        <label className={`${style.upload} ${arquivoRelatorio ? style.uploadConcluido : ""}`}>
         <input
          type="file"
          accept="image/*"
          hidden
          onChange={(evento) => selecionarArquivo(evento, setArquivoRelatorio)}
         />
         {arquivoRelatorio ? (
          <>
           <span className={style.uploadCheck}>✓</span>
           <span>Arquivo enviado com sucesso!</span>
           <span className={style.uploadLegenda}>{arquivoRelatorio}</span>
          </>
         ) : (
          <>
           <IconeNuvemUpload />
           <span>Clique para fazer upload ou arraste o arquivo aqui</span>
           <span className={style.uploadLegenda}>Máximo 10 MB - Apenas imagens</span>
          </>
         )}
        </label>
       </div>

       <div className={style.campoSimples}>
        Foto do seu cabelo *
        <p className={style.subLabel}>
         Favor enviar APENAS UMA foto de como é/era seu cabelo
        </p>
        <label className={`${style.upload} ${arquivoCabelo ? style.uploadConcluido : ""}`}>
         <input
          type="file"
          accept="image/*"
          hidden
          onChange={(evento) => selecionarArquivo(evento, setArquivoCabelo)}
         />
         {arquivoCabelo ? (
          <>
           <span className={style.uploadCheck}>✓</span>
           <span>Arquivo enviado com sucesso!</span>
           <span className={style.uploadLegenda}>{arquivoCabelo}</span>
          </>
         ) : (
          <>
           <IconeNuvemUpload />
           <span>Clique para fazer upload ou arraste o arquivo aqui</span>
           <span className={style.uploadLegenda}>Máximo 10 MB - Apenas imagens</span>
          </>
         )}
        </label>
       </div>

       <div className={style.acoes}>
        <button className={style.botaoVoltar} onClick={voltar}>Voltar</button>
        <button className={style.botaoAvancar} onClick={avancar}>Avançar</button>
       </div>
      </section>
     </>
    )}

    {passoAtual === 4 && (
     <>
      <section className={style.card}>
       <h2 className={style.tituloCard}>Declaração</h2>

       <label className={style.checkboxOpcao}>
        <input type="checkbox" />
        Estou ciente que o presente questionário foi enviado a meu pedido e com meu
        consentimento. Declaro não ter condições de comprar uma peruca.
       </label>

       <label className={style.campoSimples}>
        Nome Completo do Solicitante*
        <input type="text" placeholder="Ex. Maria Silva" />
       </label>

       <label className={style.campoSimples}>
        RG do Solicitante*
        <input type="text" placeholder="Ex. 12.345.678-9" />
       </label>
      </section>

      <div className={style.rodapeDeclaracao}>
       <p className={style.assinatura}>Com Amor, Débora e equipe IAM</p>
       <div className={style.acoes}>
        <button className={style.botaoVoltar} onClick={voltar}>Voltar</button>
        <button className={style.botaoAvancar} onClick={enviarFormulario}>Enviar Formulário</button>
       </div>
      </div>
     </>
    )}
   </main>

   <footer className={style.footer}>
    <div className={style.logoRodape}>
     <img src={logo} alt="Instituto Amor em Mechas" />
    </div>
    <p>© 2025 Instituto Amor em mechas. Todos os direitos reservados.</p>
   </footer>
  </div>
 );
}

export default FormularioPeruca;
