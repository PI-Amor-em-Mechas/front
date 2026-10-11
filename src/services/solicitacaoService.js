import { isAxiosError } from "axios";
import api from "./api";
import { EnvioFormularioError } from "./EnvioFormularioError";
import { buscarArquivo, enviarArquivo, mensagemErroArquivo } from "./arquivoService";

// Traduz o erro do Axios para a nossa exceção, usando o formato que o
// GlobalExceptionHandler do backend devolve: { erro, campos }.
function traduzirErro(etapa, erro) {
  if (!isAxiosError(erro)) {
    return new EnvioFormularioError(etapa, "Erro inesperado ao enviar o formulário.");
  }
  if (!erro.response) {
    return new EnvioFormularioError(etapa, "Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }
  if ([403, 409].includes(erro.response.status)) {
    return new EnvioFormularioError(etapa, mensagemErroArquivo(erro));
  }
  const { erro: mensagem, campos } = erro.response.data ?? {};
  return new EnvioFormularioError(etapa, mensagem ?? "O servidor recusou os dados enviados.", campos);
}

// Executa um POST e, se falhar, já converte para EnvioFormularioError informando a etapa.
async function post(etapa, url, corpo, config) {
  try {
    const { data } = await api.post(url, corpo, config);
    return data;
  } catch (erro) {
    throw traduzirErro(etapa, erro);
  }
}

async function upload(etapa, arquivo, tipo, pacienteId) {
  try {
    return await enviarArquivo(arquivo, tipo, pacienteId);
  } catch (error_) {
    throw new EnvioFormularioError(etapa, mensagemErroArquivo(error_));
  }
}

async function exigirLaudoAprovado(progresso) {
  try {
    progresso.documento = await buscarArquivo(progresso.relatorioId);
  } catch (error_) {
    throw new EnvioFormularioError("relatório médico", mensagemErroArquivo(error_));
  }
  if (progresso.documento.statusValidacao === "APROVADO") return;
  const pendente = progresso.documento.statusValidacao === "PENDENTE";
  const mensagem = progresso.documento.statusValidacao === "REJEITADO"
    ? `Documento rejeitado: ${progresso.documento.observacaoValidacao || "Envie um novo documento."}`
    : "Arquivo recebido. Aguardando validação da equipe antes de concluir a solicitação.";
  const erro = new EnvioFormularioError("relatório médico", mensagem);
  erro.aguardandoValidacao = pendente;
  throw erro;
}

export async function enviarSolicitacao(f, progresso) {
  if (!progresso.enderecoId) {
    const endereco = await post("endereço", "/enderecos", {
      cep: f.cep,
      rua: f.endereco,
      numero: f.numero,
      complemento: f.complemento,
      bairro: f.bairro,
      cidade: f.cidade,
      estado: f.estado,
    });
    progresso.enderecoId = endereco.id;
  }

  if (!progresso.solicitanteId) {
    const solicitante = await post("solicitante", "/solicitantes", {
      nomeCompleto: f.nomeSolicitante,
      rg: f.rgSolicitante,
    });
    progresso.solicitanteId = solicitante.id;
  }

  if (!progresso.pacienteId) {
    const temFilhos = f.temFilhos === "sim";
    const idadesFilhos = temFilhos ? f.idadesFilhos.map(Number) : [];
    const paciente = await post("paciente", "/formulario-solicitacao-peruca", {
      nomeCompleto: f.nomePaciente,
      email: f.email,
      cel: f.celular,
      dtNasc: f.dataNascimento,
      cpf: f.cpf,
      estadoCivil: f.estadoCivil,
      temFilhos,
      qtdFilhos: idadesFilhos.length,
      idadesFilhos, // o backend já cria os filhos a partir desta lista
      qtdPessoasEmCasa: Number(f.qtdPessoasEmCasa),
      enderecoId: progresso.enderecoId,
      solicitanteId: progresso.solicitanteId,
      cabeloAntesId: f.cabeloAntesId,
      consentimentoLgpd: f.declaracaoAceita,
    });
    progresso.pacienteId = paciente.id;
  }

  if (!progresso.relatorioId) {
    const arq = await upload("relatório médico", f.arquivoRelatorio, "RELATORIO_MEDICO", progresso.pacienteId);
    progresso.relatorioId = arq.id;
    progresso.documento = arq;
  }

  if (!progresso.cabeloId) {
    const arq = await upload("foto do cabelo", f.arquivoCabelo, "FOTO_CABELO");
    progresso.cabeloId = arq.id;
  }

  if (!progresso.dadosMedicosOk) {
    await exigirLaudoAprovado(progresso);
    await post("dados médicos", "/dados-medicos", {
      motivo: f.motivo,
      tipoCancer: f.tipoCancer || "Não se aplica",
      // O formulário não tem campo de justificativa e o backend exige uma.
      justificativa: "Declara não ter condições de comprar uma peruca.",
      dtInicioTratamento: f.dtInicioTratamento,
      tipoAtendimento: f.tipoAtendimento,
      pacienteId: progresso.pacienteId,
      relatorioMedicoId: progresso.relatorioId,
    });
    progresso.dadosMedicosOk = true;
  }

  if (!progresso.kitOk) {
    await post("kit amor", "/kits", {
      // O formulário não pergunta a cor da peruca e o backend exige o campo.
      corPeruca: "A definir",
      pacienteId: progresso.pacienteId,
      solicitanteId: progresso.solicitanteId,
    });
    progresso.kitOk = true;
  }
}

/**
 * Envia a avaliação do formulário (POST /avaliacoes).
 * Deve ser chamada DEPOIS do envio da solicitação: o backend procura o paciente
 * pelo solicitanteId, então o paciente já precisa existir.
 * A nota vai de 0 a 5 (regra do backend); `concluido` é true porque o formulário foi enviado.
 */
export async function enviarAvaliacao({ solicitanteId, nota, consentimento }) {
  return post("avaliação", "/avaliacoes", {
    solicitanteId,
    notaFormulario: nota,
    concluido: true,
    consentimento,
  });
}

/**
 * Consulta o ViaCEP através do backend (POST /enderecos/viacep).
 * Recebe o CEP só com os 8 dígitos. Devolve { logradouro, bairro, localidade, uf }.
 * Para um CEP que não existe, o ViaCEP responde sem erro HTTP, mas com os campos vazios;
 * quem chama deve checar isso.
 */
export async function buscarCep(cep) {
  return post("cep", "/enderecos/viacep", { cep });
}
