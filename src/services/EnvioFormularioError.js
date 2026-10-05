// Exceção própria do envio do formulário.
// Guarda em qual etapa deu erro e os erros por campo que o backend devolveu,
// para a tela conseguir mostrar uma mensagem clara em vez de um "deu erro" genérico.
export class EnvioFormularioError extends Error {
  constructor(etapa, mensagem, campos = {}) {
    super(mensagem);
    this.name = "EnvioFormularioError";
    this.etapa = etapa;
    this.campos = campos;
  }
}
