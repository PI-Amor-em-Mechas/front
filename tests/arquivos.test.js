import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";
import { validarArquivo, LIMITE_ARQUIVO } from "../src/services/arquivoValidation.js";

test("valida assinatura, extensão, tamanho e nome seguro", async () => {
  const documento = await validarArquivo(new File(["%PDF-1.7"], "../laudo teste.pdf", { type: "application/pdf" }));
  assert.equal(documento.name, "laudo_teste.pdf");
  assert.equal((await validarArquivo(new File(["%PDF-1.7"], "CON.pdf"))).name, "documento_CON.pdf");
  await assert.rejects(() => validarArquivo(new File(["abc"], "teste.constructor")), /Tipo inválido/);
  await assert.rejects(() => validarArquivo(new File(["abc"], "teste.__proto__")), /Tipo inválido/);
  for (const [bytes, nome] of [["%PDF-1.7", "foto.png"], ["texto", "laudo.pdf"], ["abc", "teste.exe"], ["", "vazio.pdf"]]) {
    await assert.rejects(() => validarArquivo(new File([bytes], nome)));
  }
  await assert.rejects(() => validarArquivo(new File([new Uint8Array(LIMITE_ARQUIVO + 1)], "grande.pdf")));
  await validarArquivo(new File([new Uint8Array([255, 216, 255, 224])], "foto.jpeg"));
  await validarArquivo(new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "foto.png"));
});

test("laudo pendente/rejeitado não cria dados médicos e aprovado retoma sem duplicar", async () => {
  const servidor = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  let token = null;
  globalThis.sessionStorage = { getItem: () => token };
  try {
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    const { enviarSolicitacao } = await servidor.ssrLoadModule("/src/services/solicitacaoService.js");
    const { podeRevisarDocumentos } = await servidor.ssrLoadModule("/src/services/authService.js");
    const { listarPendentes, revisarArquivo, obterConteudoArquivo, mensagemErroArquivo } = await servidor.ssrLoadModule("/src/services/arquivoService.js");
    let status = "PENDENTE";
    const chamadas = [];
    api.defaults.adapter = async (config) => {
      chamadas.push(`${config.method} ${config.url}`);
      const data = config.url.startsWith("/arquivos")
        ? { id: 1, statusValidacao: status, observacaoValidacao: "Sem identificação" } : { id: 2 };
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    const form = { arquivoRelatorio: new File(["%PDF-1.7"], "laudo.pdf"), arquivoCabelo: new File([new Uint8Array([255, 216, 255])], "foto.jpg"), temFilhos: "nao" };
    const progresso = {};
    await assert.rejects(() => enviarSolicitacao(form, progresso), /Aguardando validação/);
    assert.deepEqual(chamadas, ["post /arquivos", "get /arquivos/1"]);
    status = "REJEITADO";
    await assert.rejects(() => enviarSolicitacao(form, progresso), /Sem identificação/);
    assert.ok(!chamadas.includes("post /dados-medicos"));
    status = "APROVADO";
    await enviarSolicitacao(form, progresso);
    assert.equal(chamadas.filter((chamada) => chamada === "post /arquivos").length, 2);
    assert.equal(chamadas.filter((chamada) => chamada === "post /dados-medicos").length, 1);
    await enviarSolicitacao(form, progresso);
    assert.equal(chamadas.filter((chamada) => chamada === "post /dados-medicos").length, 1);
    for (const role of ["ROLE_ADMIN", "ROLE_MEDICO", "ROLE_ENFERMEIRO"]) {
      token = `test.${btoa(JSON.stringify({ role, exp: Date.now() / 1000 + 3600 }))}.test`;
      assert.equal(podeRevisarDocumentos(), true);
      await assert.rejects(() => revisarArquivo(1, "REJEITADO", "  "), /observação/);
    }
    token = `test.${btoa(JSON.stringify({ role: "ROLE_ATENDENTE", exp: Date.now() / 1000 + 3600 }))}.test`;
    assert.equal(podeRevisarDocumentos(), false);
    const totalChamadas = chamadas.length;
    await assert.rejects(listarPendentes, /Acesso restrito/);
    await assert.rejects(() => revisarArquivo(1, "APROVADO", ""), /Acesso restrito/);
    assert.equal(chamadas.length, totalChamadas);
    status = "PENDENTE";
    await assert.rejects(() => obterConteudoArquivo(1), /Acesso restrito/);
    assert.ok(!chamadas.some((chamada) => chamada.endsWith("/download")));
    token = `test.${btoa(JSON.stringify({ role: "ROLE_ADMIN", exp: 1 }))}.test`;
    assert.equal(podeRevisarDocumentos(), false);
    token = "inválido";
    assert.equal(podeRevisarDocumentos(), false);
    assert.match(mensagemErroArquivo({ response: { status: 403 } }), /Acesso restrito/);
    assert.match(mensagemErroArquivo({ response: { status: 409 } }), /ainda não foi aprovado/);
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});