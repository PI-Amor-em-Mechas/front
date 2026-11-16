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

test("fluxo público envia relatório com contexto temporário sem role administrativa", async () => {
  const servidor = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  let accessToken = null;
  globalThis.sessionStorage = { getItem: () => accessToken };
  try {
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    const { enviarSolicitacao } = await servidor.ssrLoadModule("/src/services/solicitacaoService.js");
    const { enviarRelatorioPublico, enviarArquivoAdministrativo, mensagemErroArquivo } = await servidor.ssrLoadModule("/src/services/arquivoService.js");
    const chamadas = [];
    const uploads = [];
    api.defaults.adapter = async (config) => {
      chamadas.push(config);
      if (config.method === "post" && config.url === "/arquivos") uploads.push(config.data);
      const data = config.url === "/formulario-solicitacao-peruca"
        ? { id: 2, applicationToken: "temporario" }
        : config.url === "/arquivos"
          ? { id: uploads.length, statusValidacao: "PENDENTE" }
          : { id: 2 };
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    const form = {
      arquivoRelatorio: new File(["%PDF-1.7"], "laudo.pdf"),
      arquivoCabelo: new File([new Uint8Array([255, 216, 255])], "foto.jpg"),
      temFilhos: "nao", complemento: "Bloco B",
    };
    const progresso = {};
    await assert.rejects(() => enviarSolicitacao(form, progresso), /encaminhado para análise/);
    assert.deepEqual(chamadas.map(({ method, url }) => `${method} ${url}`), [
      "post /enderecos", "post /solicitantes", "post /formulario-solicitacao-peruca", "post /arquivos", "post /arquivos",
    ]);
    assert.equal(uploads[0].get("pacienteId"), "2");
    assert.equal(uploads[0].get("tipo"), "RELATORIO_MEDICO");
    assert.equal(uploads[1].get("pacienteId"), "2");
    assert.equal(chamadas[3].headers["X-Application-Token"], "temporario");
    assert.equal(chamadas[3].headers.Authorization, undefined);
    assert.equal(chamadas[4].headers["X-Application-Token"], "temporario");
    assert.equal(JSON.parse(chamadas[0].data).complemento, "Bloco B");
    assert.equal(progresso.pacienteId, 2);
    assert.equal(progresso.applicationToken, undefined);
    const totalChamadas = chamadas.length;
    await assert.rejects(() => enviarSolicitacao(form, progresso), /encaminhado para análise/);
    assert.equal(chamadas.length, totalChamadas);
    await assert.rejects(() => enviarRelatorioPublico(form.arquivoRelatorio, 2), /autorizar/);
    await assert.rejects(() => enviarRelatorioPublico(form.arquivoRelatorio, null, "temporario"), /identificar/);
    await assert.rejects(() => enviarArquivoAdministrativo(form.arquivoRelatorio, "RELATORIO_MEDICO", 2), /acesso/);
    accessToken = `test.${btoa(JSON.stringify({ role: "ROLE_MEDICO", exp: Date.now() / 1000 + 3600 }))}.test`;
    await enviarArquivoAdministrativo(form.arquivoRelatorio, "RELATORIO_MEDICO", 2);
    assert.match(chamadas.at(-1).headers.Authorization, /^Bearer /);
    assert.equal(chamadas.at(-1).headers["X-Application-Token"], undefined);
    assert.match(mensagemErroArquivo({ response: { status: 413 } }), /limite/);
    assert.match(mensagemErroArquivo({ response: { status: 500, data: { message: "SQL" } } }), /Não foi possível/);
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});

test("falha do applicationToken não dispara refresh administrativo", async () => {
  const servidor = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  let refreshes = 0;
  globalThis.sessionStorage = { getItem: (key) => key.includes("accessToken") ? "jwt" : "refresh" };
  try {
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    const { enviarRelatorioPublico } = await servidor.ssrLoadModule("/src/services/arquivoService.js");
    api.defaults.adapter = async (config) => {
      if (config.url === "/auth/refresh") refreshes++;
      const erro = new Error("temporário expirado");
      erro.config = config;
      erro.response = { status: 401, data: { erro: "expirado" } };
      throw erro;
    };
    await assert.rejects(() => enviarRelatorioPublico(new File(["%PDF-1.7"], "laudo.pdf"), 2, "temporario"));
    assert.equal(refreshes, 0);
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});
