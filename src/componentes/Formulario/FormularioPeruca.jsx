import { useRef, useState } from "react";
import style from "./FormularioPeruca.module.css";
import logo from "../../assets/logo amor em mechas.png";
import { enviarSolicitacao, enviarAvaliacao, buscarCep } from "../../services/solicitacaoService";
import { EnvioFormularioError } from "../../services/EnvioFormularioError";

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

const FORM_INICIAL = {
 nomePaciente: "", email: "", dataNascimento: "", celular: "", cpf: "", cep: "",
 endereco: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "",
 estadoCivil: "", temFilhos: "sim", qtdFilhos: "", idadesFilhos: [], qtdPessoasEmCasa: "",
 motivo: "quimioterapico", tipoCancer: "", dtInicioTratamento: "", tipoAtendimento: "sus",
 arquivoRelatorio: null, arquivoCabelo: null,
 declaracaoAceita: false, nomeSolicitante: "", rgSolicitante: "",
};

function FormularioPeruca({irParaDashboard}) {
 const [aceitouCookies, setAceitouCookies] = useState(false);
 const [passoAtual, setPassoAtual] = useState(1);
 const [enviado, setEnviado] = useState(false);
 const [arquivoRelatorio, setArquivoRelatorio] = useState(null);
 const [arquivoCabelo, setArquivoCabelo] = useState(null);
 const totalPassos = 4;
 const [form, setForm] = useState(FORM_INICIAL);
 // avaliação do formulário (tela de sucesso)
 const [solicitanteId, setSolicitanteId] = useState(null);
 const [nota, setNota] = useState(0);
 const [notaHover, setNotaHover] = useState(0);
 const [consentimentoAval, setConsentimentoAval] = useState(false);
 const [enviandoAval, setEnviandoAval] = useState(false);
 const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
 const [erroAval, setErroAval] = useState(null);
 const [enviando, setEnviando] = useState(false);
 const [erroEnvio, setErroEnvio] = useState(null);
 // ViaCEP
 const [buscandoCep, setBuscandoCep] = useState(false);
 const [erroCep, setErroCep] = useState(null);
 const cepBuscado = useRef(""); // último CEP consultado (evita consulta repetida e resposta "velha")
 // ids já criados no backend; useRef mantém o valor entre tentativas sem re-renderizar
 const progresso = useRef({});

 function atualizar(nome, valor) {
  setForm((atual) => ({ ...atual, [nome]: valor }));
 }

 // devolve value + onChange para campos de texto, select e date
 function campo(nome) {
  return { value: form[nome], onChange: (e) => atualizar(nome, e.target.value) };
 }

 // Formata enquanto digita (12345-678) e consulta o ViaCEP quando completar 8 dígitos.
 function alterarCep(texto) {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  const formatado = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
  atualizar("cep", formatado);
  setErroCep(null);

  if (digitos.length === 8) {
   preencherEnderecoPeloCep(digitos);
  } else {
   cepBuscado.current = "";
   setBuscandoCep(false);
  }
 }

 async function preencherEnderecoPeloCep(digitos) {
  if (cepBuscado.current === digitos) return;
  cepBuscado.current = digitos;
  setBuscandoCep(true);
  try {
   const dados = await buscarCep(digitos);
   // se a pessoa mudou o CEP enquanto a resposta vinha, ignora esta resposta
   if (cepBuscado.current !== digitos) return;

   if (!dados?.logradouro && !dados?.localidade) {
    setErroCep("CEP não encontrado. Preencha o endereço manualmente.");
    return;
   }
   // só sobrescreve o que o ViaCEP trouxe; número e complemento a pessoa preenche
   setForm((atual) => ({
    ...atual,
    endereco: dados.logradouro || atual.endereco,
    bairro: dados.bairro || atual.bairro,
    cidade: dados.localidade || atual.cidade,
    estado: dados.uf || atual.estado,
   }));
  } catch {
   if (cepBuscado.current === digitos) {
    setErroCep("Não foi possível consultar o CEP agora. Preencha o endereço manualmente.");
   }
  } finally {
   if (cepBuscado.current === digitos) setBuscandoCep(false);
  }
 }

 function aceitarCookies() {
  setAceitouCookies(true);
 }

 const MAX_FILHOS = 15;

 // Quando a pessoa muda "quantos filhos", a lista de idades é redimensionada:
 // mantém o que já foi digitado e cria/remove só as caixinhas necessárias.
 function alterarQtdFilhos(texto) {
  const qtd = Math.min(Math.max(parseInt(texto, 10) || 0, 0), MAX_FILHOS);
  setForm((atual) => ({
   ...atual,
   qtdFilhos: texto === "" ? "" : String(qtd),
   idadesFilhos: Array.from({ length: qtd }, (_, i) => atual.idadesFilhos[i] ?? ""),
  }));
 }

 function alterarIdadeFilho(indice, valor) {
  setForm((atual) => {
   const idades = [...atual.idadesFilhos];
   idades[indice] = valor;
   return { ...atual, idadesFilhos: idades };
  });
 }

 // Se marcar "Não", limpa os dados de filhos para não enviar lixo.
 function alterarTemFilhos(valor) {
  setForm((atual) => ({
   ...atual,
   temFilhos: valor,
   ...(valor === "nao" ? { qtdFilhos: "", idadesFilhos: [] } : {}),
  }));
 }

 function filhosValidos() {
  if (form.temFilhos !== "sim") return true;
  return (
   form.idadesFilhos.length > 0 &&
   form.idadesFilhos.every((idade) => idade !== "" && Number(idade) >= 0 && Number(idade) <= 120)
  );
 }

 function avancar() {
  if (passoAtual === 2 && !filhosValidos()) {
   setErroEnvio("Informe quantos filhos você tem e a idade de cada um.");
   return;
  }
  setErroEnvio(null);
  setPassoAtual((passo) => Math.min(passo + 1, totalPassos));
 }

 function voltar() {
  setPassoAtual((passo) => Math.max(passo - 1, 1));
 }

 async function enviarFormulario() {
  setErroEnvio(null);
  if (!form.declaracaoAceita) {
   setErroEnvio("Marque a declaração para enviar o formulário.");
   return;
  }
  if (!form.arquivoRelatorio || !form.arquivoCabelo) {
   setErroEnvio("Envie a foto do relatório médico e a foto do cabelo (passo 3).");
   return;
  }
  setEnviando(true);
  try {
   await enviarSolicitacao(form, progresso.current);
   // a avaliação precisa do id do solicitante, então guardamos antes de limpar o progresso
   setSolicitanteId(progresso.current.solicitanteId);
   progresso.current = {};
   setEnviado(true);
  } catch (erro) {
   if (erro instanceof EnvioFormularioError) {
    const detalhes = Object.values(erro.campos).join("; ");
    setErroEnvio(`Falha na etapa "${erro.etapa}": ${erro.message}${detalhes ? " (" + detalhes + ")" : ""}`);
   } else {
    setErroEnvio("Erro inesperado ao enviar o formulário.");
   }
  } finally {
   setEnviando(false);
  }
 }

 function selecionarArquivo(evento, definirArquivo, nomeCampo) {
  const arquivo = evento.target.files[0];
  definirArquivo(arquivo ? arquivo.name : null);
  atualizar(nomeCampo, arquivo ?? null);
 }

 async function enviarAvaliacaoFormulario() {
  setErroAval(null);
  if (nota < 1) {
   setErroAval("Escolha uma nota de 1 a 5 estrelas.");
   return;
  }
  if (!consentimentoAval) {
   setErroAval("Marque o consentimento para enviar sua avaliação.");
   return;
  }
  setEnviandoAval(true);
  try {
   await enviarAvaliacao({ solicitanteId, nota, consentimento: consentimentoAval });
   setAvaliacaoEnviada(true);
  } catch (erro) {
   if (erro instanceof EnvioFormularioError) {
    const detalhes = Object.values(erro.campos).join("; ");
    setErroAval(`${erro.message}${detalhes ? " (" + detalhes + ")" : ""}`);
   } else {
    setErroAval("Erro inesperado ao enviar a avaliação.");
   }
  } finally {
   setEnviandoAval(false);
  }
 }

 function retornarAoFormulario() {
  // limpa tudo para a próxima pessoa começar um formulário em branco
  setForm(FORM_INICIAL);
  setArquivoRelatorio(null);
  setArquivoCabelo(null);
  setSolicitanteId(null);
  setNota(0);
  setNotaHover(0);
  setConsentimentoAval(false);
  setAvaliacaoEnviada(false);
  setErroAval(null);
  setErroEnvio(null);
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

     <div className={style.avaliacao}>
      {avaliacaoEnviada ? (
       <p className={style.avaliacaoObrigado}>Obrigado pela sua avaliação! 💗</p>
      ) : (
       <>
        <h2 className={style.avaliacaoTitulo}>Como foi preencher este formulário?</h2>
        <div className={style.estrelas} onMouseLeave={() => setNotaHover(0)}>
         {[1, 2, 3, 4, 5].map((valor) => (
          <button
           key={valor}
           type="button"
           className={`${style.estrela} ${valor <= (notaHover || nota) ? style.estrelaAtiva : ""}`}
           onClick={() => setNota(valor)}
           onMouseEnter={() => setNotaHover(valor)}
           aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`}
          >
           ★
          </button>
         ))}
        </div>
        <label className={style.checkboxOpcao}>
         <input
          type="checkbox"
          checked={consentimentoAval}
          onChange={(e) => setConsentimentoAval(e.target.checked)}
         />
         Autorizo o uso da minha avaliação para melhorar o formulário.
        </label>
        {erroAval && <p className={style.erroEnvio}>{erroAval}</p>}
        <button
         className={style.botaoAvancar}
         onClick={enviarAvaliacaoFormulario}
         disabled={enviandoAval}
        >
         {enviandoAval ? "Enviando..." : "Enviar avaliação"}
        </button>
       </>
      )}
     </div>

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
      <button className={style.botaoEquipe} type="button" onClick={irParaDashboard}>Área da equipe</button>
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
         <input type="text" placeholder="Ex. Luciana Silva" {...campo("nomePaciente")} />
        </label>
        <label className={style.campo}>
         Seu email *
         <input type="email" placeholder="Ex. luciana@email.com" {...campo("email")} />
        </label>
        <label className={style.campo}>
         Data do Nascimento *
         <input type="date" placeholder="dd/mm/aaaa" {...campo("dataNascimento")} />
        </label>
        <label className={style.campo}>
         Celular *
         <input type="tel" placeholder="Ex. 11 987654321" {...campo("celular")} />
        </label>
        <label className={style.campo}>
         CPF *
         <input type="text" placeholder="Ex. 123.456.789-11" {...campo("cpf")} />
        </label>
        <label className={style.campo}>
         CEP *
         <input
          type="text"
          inputMode="numeric"
          maxLength={9}
          placeholder="Ex. 12345-678"
          value={form.cep}
          onChange={(e) => alterarCep(e.target.value)}
         />
         {buscandoCep && <span className={style.subLabel}>Buscando endereço...</span>}
         {erroCep && <span className={style.erroCep}>{erroCep}</span>}
        </label>
       </div>
      </section>

      <section className={style.card}>
       <h2 className={style.tituloCard}>Endereço de Entrega</h2>
       <div className={style.grid}>
        <label className={`${style.campo} ${style.largo}`}>
         Endereço completo *
         <input type="text" placeholder="Ex. Rua, Número, Bairro, Cidade, Estado" {...campo("endereco")} />
        </label>
        <label className={style.campo}>
         Número *
         <input type="text" placeholder="Ex. 2500" {...campo("numero")} />
        </label>
        <label className={style.campo}>
         Bairro *
         <input type="text" placeholder="Ex. Barra Funda" {...campo("bairro")} />
        </label>
        <label className={style.campo}>
         Cidade *
         <input type="text" placeholder="Ex. São Paulo" {...campo("cidade")} />
        </label>
        <label className={style.campo}>
         Estado *
         <select {...campo("estado")}>
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
         <input type="text" placeholder="Ex. Bloco B" {...campo("complemento")} />
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
       <select {...campo("estadoCivil")}>
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
         <input type="radio" name="temFilhos" value="sim" checked={form.temFilhos === "sim"} onChange={() => alterarTemFilhos("sim")} />
         Sim
        </label>
        <label className={style.radioOpcao}>
         <input type="radio" name="temFilhos" value="nao" checked={form.temFilhos === "nao"} onChange={() => alterarTemFilhos("nao")} />
         Não
        </label>
       </div>
      </div>

      {form.temFilhos === "sim" && (
       <>
        <label className={style.campoSimples}>
         Quantos filhos? *
         <input
          type="number"
          min="1"
          max={MAX_FILHOS}
          placeholder="Ex. 2"
          value={form.qtdFilhos}
          onChange={(e) => alterarQtdFilhos(e.target.value)}
         />
        </label>

        {form.idadesFilhos.map((idade, indice) => (
         <label key={indice} className={style.campoSimples}>
          Idade do {indice + 1}º filho(a) *
          <input
           type="number"
           min="0"
           max="120"
           placeholder="Ex. 10"
           value={idade}
           onChange={(e) => alterarIdadeFilho(indice, e.target.value)}
          />
         </label>
        ))}
       </>
      )}

      <label className={style.campoSimples}>
       Quantas pessoas moram com você? *
       <input type="text" placeholder="Ex. 2" {...campo("qtdPessoasEmCasa")} />
      </label>

      {erroEnvio && <p className={style.erroEnvio}>{erroEnvio}</p>}

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
          <input type="radio" name="motivo" value="quimioterapico" checked={form.motivo === "quimioterapico"} onChange={() => atualizar("motivo", "quimioterapico")} />
          Tratamento quimioterápico
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="motivo" value="alopecia" checked={form.motivo === "alopecia"} onChange={() => atualizar("motivo", "alopecia")} />
          Alopecia Areata
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="motivo" value="outros" checked={form.motivo === "outros"} onChange={() => atualizar("motivo", "outros")} />
          Outros
         </label>
        </div>
       </div>

       <label className={style.campoSimples}>
        Em caso de tratamento quimioterápico, qual o tipo de câncer *
        <select {...campo("tipoCancer")}>
         <option value="" disabled>Selecione o tipo</option>
         <option value="mama">Mama</option>
         <option value="prostata">Próstata</option>
         <option value="pulmao">Pulmão</option>
         <option value="outro">Outro</option>
        </select>
       </label>

       <label className={style.campoSimples}>
        Início das quimioterapias ou tratamento *
        <input type="date" placeholder="dd/mm/yyyy" {...campo("dtInicioTratamento")} />
       </label>

       <div className={style.campoSimples}>
        Tipo de atendimento durante o tratamento *
        <p className={style.subLabel}>
         Vale ressaltar que priorizamos a doação para pacientes em tratamento pelo SUS.
        </p>
        <div className={style.radioGroup}>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="sus" checked={form.tipoAtendimento === "sus"} onChange={() => atualizar("tipoAtendimento", "sus")} />
          Público - SUS
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="convenio" checked={form.tipoAtendimento === "convenio"} onChange={() => atualizar("tipoAtendimento", "convenio")} />
          Convênio
         </label>
         <label className={style.radioOpcao}>
          <input type="radio" name="atendimento" value="particular" checked={form.tipoAtendimento === "particular"} onChange={() => atualizar("tipoAtendimento", "particular")} />
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
          onChange={(evento) => selecionarArquivo(evento, setArquivoRelatorio, "arquivoRelatorio")}
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
          onChange={(evento) => selecionarArquivo(evento, setArquivoCabelo, "arquivoCabelo")}
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
        <input type="checkbox" checked={form.declaracaoAceita} onChange={(e) => atualizar("declaracaoAceita", e.target.checked)} />
        Estou ciente que o presente questionário foi enviado a meu pedido e com meu
        consentimento. Declaro não ter condições de comprar uma peruca.
       </label>

       <label className={style.campoSimples}>
        Nome Completo do Solicitante*
        <input type="text" placeholder="Ex. Maria Silva" {...campo("nomeSolicitante")} />
       </label>

       <label className={style.campoSimples}>
        RG do Solicitante*
        <input type="text" placeholder="Ex. 12.345.678-9" {...campo("rgSolicitante")} />
       </label>
      </section>

      <div className={style.rodapeDeclaracao}>
       <p className={style.assinatura}>Com Amor, Débora e equipe IAM</p>
       {erroEnvio && <p className={style.erroEnvio}>{erroEnvio}</p>}
       <div className={style.acoes}>
        <button className={style.botaoVoltar} onClick={voltar}>Voltar</button>
        <button className={style.botaoAvancar} onClick={enviarFormulario} disabled={enviando}>{enviando ? "Enviando..." : "Enviar Formulário"}</button>
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
