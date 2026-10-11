export const STATUS_COMPARACAO = {
  NAO_SOLICITADA: "Comparação não solicitada",
  AGUARDANDO: "Aguardando comparação",
  PROCESSANDO: "Comparação em processamento",
  CONCLUIDA: "Comparação concluída",
  FALHA: "Não foi possível concluir a comparação",
};

export const CAMPOS_COMPARACAO = {
  nomeCompleto: "Nome do paciente", email: "E-mail", dtPedido: "Data do pedido",
  cel: "Celular", dtNasc: "Data de nascimento", estadoCivil: "Estado civil",
  temFilhos: "Possui filhos", qtdPessoasEmCasa: "Pessoas na residência", cpf: "CPF",
  cabeloAntesId: "Foto do cabelo", enderecoId: "Endereço", "endereco.rua": "Rua",
  "endereco.numero": "Número", "endereco.bairro": "Bairro", "endereco.cidade": "Cidade",
  "endereco.estado": "Estado", "endereco.cep": "CEP", qtdFilhos: "Quantidade de filhos",
  idadesFilhos: "Idades dos filhos", solicitanteId: "Solicitante",
  "solicitante.nomeCompleto": "Nome do solicitante", "solicitante.rg": "RG do solicitante",
  consentimentoLgpd: "Consentimento LGPD",
};

export const RESULTADOS_COMPARACAO = {
  CONFERE: "Confere", DIVERGENTE: "Divergente", INCONCLUSIVO: "Inconclusivo",
};

export function rotuloComparacao(mapa, chave, fallback) {
  return Object.hasOwn(mapa, chave) ? mapa[chave] : fallback;
}

export function comparacaoEmAndamento(status) {
  return ["AGUARDANDO", "PROCESSANDO"].includes(status);
}

export function esperarComparacao(intervalo, signal) {
  return new Promise((resolve, reject) => {
    function cancelar() {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancelar);
      reject(new DOMException("Consulta interrompida", "AbortError"));
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancelar);
      resolve();
    }, intervalo);
    signal.addEventListener("abort", cancelar, { once: true });
    if (signal.aborted) cancelar();
  });
}

export async function acompanharComparacao({ id, signal, consultar, aoAtualizar, esperar = esperarComparacao, intervalo = 5000, limite = 24 }) {
  for (let tentativa = 0; tentativa < limite; tentativa += 1) {
    if (signal.aborted) return "INTERROMPIDA";
    await esperar(intervalo, signal);
    if (signal.aborted) return "INTERROMPIDA";
    const documento = await consultar(id, signal);
    if (signal.aborted) return "INTERROMPIDA";
    aoAtualizar(documento);
    if (!comparacaoEmAndamento(documento.statusComparacao)) return "FINALIZADA";
  }
  return "LIMITE";
}