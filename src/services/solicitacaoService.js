import { isAxiosError } from "axios";
import api from "./api";
import { EnvioFormularioError } from "./EnvioFormularioError";

// Traduz o erro do Axios para a nossa exceção, usando o formato que o
// GlobalExceptionHandler do backend devolve: { erro, campos }.
function traduzirErro(etapa, erro) {
  if (!isAxiosError(erro)) {
    return new EnvioFormularioError(etapa, "Erro inesperado ao enviar o formulário.");
  }
  if (!erro.response) {
    return new EnvioFormularioError(etapa, "Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
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

function enviarArquivo(etapa, arquivo, tipo) {
  const formData = new FormData();
  formData.append("arquivo", arquivo);
  formData.append("tipo", tipo);
  return post(etapa, "/arquivos", formData); // o Axios define o multipart sozinho
}

/**
 * Envia a solicitação inteira, um POST por vez, respeitando as dependências:
 *   1. /arquivos (relatório)  e  /arquivos (foto do cabelo)  -> ids dos arquivos
 *   2. /enderecos                                            -> enderecoId
 *   3. /solicitantes                                         -> solicitanteId
 *   4. /pacientes (usa enderecoId, solicitanteId, cabeloAntesId) -> pacienteId
 *   5. /dados-medicos (usa pacienteId e id do relatório)
 *   6. /kits (usa pacienteId e solicitanteId)
 *
 * `progresso` guarda os ids já criados. Se uma etapa falhar, o usuário corrige
 * e tenta de novo: as etapas que já deram certo são puladas (evita cadastro duplicado).
 */
export async function enviarSolicitacao(f, progresso) {
  if (!progresso.relatorioId) {
    const arq = await enviarArquivo("relatório médico", f.arquivoRelatorio, "RELATORIO_MEDICO");
    progresso.relatorioId = arq.id;
  }

  if (!progresso.cabeloId) {
    const arq = await enviarArquivo("foto do cabelo", f.arquivoCabelo, "FOTO_CABELO");
    progresso.cabeloId = arq.id;
  }

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
    const paciente = await post("paciente", "/pacientes", {
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
      cabeloAntesId: progresso.cabeloId,
      consentimentoLgpd: f.declaracaoAceita,
    });
    progresso.pacienteId = paciente.id;
  }

  if (!progresso.dadosMedicosOk) {
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
