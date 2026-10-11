import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";
import { validarArquivo, LIMITE_ARQUIVO } from "../src/services/arquivoValidation.js";
import { acompanharComparacao, esperarComparacao, rotuloComparacao, CAMPOS_COMPARACAO } from "../src/services/comparacaoService.js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
  let token = `test.${btoa(JSON.stringify({ role: "ROLE_ADMIN", exp: Date.now() / 1000 + 3600 }))}.test`;
  globalThis.sessionStorage = { getItem: () => token };
  try {
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    const { enviarSolicitacao } = await servidor.ssrLoadModule("/src/services/solicitacaoService.js");
    const { podeRevisarDocumentos } = await servidor.ssrLoadModule("/src/services/authService.js");
    const { listarPendentes, revisarArquivo, obterConteudoArquivo, mensagemErroArquivo, enviarArquivo, reprocessarComparacao } = await servidor.ssrLoadModule("/src/services/arquivoService.js");
    const { default: ComparacaoDocumento } = await servidor.ssrLoadModule("/src/componentes/ComparacaoDocumento/ComparacaoDocumento.jsx");
    let status = "PENDENTE";
    const chamadas = [];
    const uploads = [];
    api.defaults.adapter = async (config) => {
      chamadas.push(`${config.method} ${config.url}`);
      if (config.method === "post" && config.url === "/arquivos") uploads.push(config.data);
      const data = config.url.startsWith("/arquivos")
        ? { id: 1, statusValidacao: status, observacaoValidacao: "Sem identificação" } : { id: 2 };
      return { data, status: 200, statusText: "OK", headers: {}, config };
    };
    const form = { arquivoRelatorio: new File(["%PDF-1.7"], "laudo.pdf"), arquivoCabelo: new File([new Uint8Array([255, 216, 255])], "foto.jpg"), temFilhos: "nao" };
    const progresso = {};
    await assert.rejects(() => enviarSolicitacao(form, progresso), /Aguardando validação/);
    assert.deepEqual(chamadas, ["post /enderecos", "post /solicitantes", "post /formulario-solicitacao-peruca", "post /arquivos", "post /arquivos", "get /arquivos/1"]);
    assert.equal(uploads[0].get("pacienteId"), "2");
    assert.equal(uploads[1].get("pacienteId"), null);
    assert.equal(progresso.pacienteId, 2);
    status = "REJEITADO";
    await assert.rejects(() => enviarSolicitacao(form, progresso), /Sem identificação/);
    assert.ok(!chamadas.includes("post /dados-medicos"));
    status = "APROVADO";
    await enviarSolicitacao(form, progresso);
    assert.equal(chamadas.filter((chamada) => chamada === "post /arquivos").length, 2);
    assert.equal(chamadas.filter((chamada) => chamada === "post /dados-medicos").length, 1);
    assert.equal(chamadas.filter((chamada) => chamada === "post /formulario-solicitacao-peruca").length, 1);
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
    await assert.rejects(() => enviarArquivo(form.arquivoRelatorio, "RELATORIO_MEDICO", 2), /associação/);
    await assert.rejects(() => reprocessarComparacao(1), /Acesso restrito/);
    assert.equal(chamadas.length, totalChamadas);
    await enviarArquivo(form.arquivoRelatorio, "RELATORIO_MEDICO");
    assert.equal(uploads.at(-1).get("pacienteId"), null);
    const restrito = renderToStaticMarkup(createElement(ComparacaoDocumento, {
      documento: { id: 1, pacienteId: 9876, statusComparacao: "CONCLUIDA", comparacaoCampos: { nomeCompleto: "CONFERE" } }, aoAtualizar: () => {},
    }));
    assert.ok(!restrito.includes("9876"));
    assert.ok(!restrito.includes("Nome do paciente"));
    status = "PENDENTE";
    await assert.rejects(() => obterConteudoArquivo(1), /Acesso restrito/);
    assert.ok(!chamadas.some((chamada) => chamada.endsWith("/download")));
    token = `test.${btoa(JSON.stringify({ role: "ROLE_ADMIN", exp: 1 }))}.test`;
    assert.equal(podeRevisarDocumentos(), false);
    token = "inválido";
    assert.equal(podeRevisarDocumentos(), false);
    assert.match(mensagemErroArquivo({ response: { status: 403 } }), /Acesso restrito/);
    assert.match(mensagemErroArquivo({ response: { status: 409 } }), /ainda não foi aprovado/);
    assert.match(mensagemErroArquivo({ response: { status: 401 } }), /Sessão expirada/);
    token = `test.${btoa(JSON.stringify({ role: "ROLE_MEDICO", exp: Date.now() / 1000 + 3600 }))}.test`;
    await reprocessarComparacao(1);
    assert.ok(chamadas.includes("post /arquivos/1/comparacao/reprocessar"));
    const antesRender = chamadas.length;
    const comparacao = renderToStaticMarkup(createElement(ComparacaoDocumento, {
      documento: { id: 1, statusValidacao: "PENDENTE", statusComparacao: "CONCLUIDA", comparacaoCampos: { nomeCompleto: "CONFERE", cpf: "DIVERGENTE", "endereco.rua": "INCONCLUSIVO", campoNovo: "CONFERE", constructor: "DESCONHECIDO" } }, aoAtualizar: () => {},
    }));
    for (const texto of ["Nome do paciente", "Divergente", "Inconclusivo", "campoNovo", "Resultado não informado"]) assert.ok(comparacao.includes(texto));
    assert.equal(chamadas.length, antesRender);
    for (const statusComparacao of ["NAO_SOLICITADA", "AGUARDANDO", "PROCESSANDO", "FALHA", "CONCLUIDA"]) {
      const html = renderToStaticMarkup(createElement(ComparacaoDocumento, { documento: { id: 1, statusComparacao }, aoAtualizar: () => {} }));
      assert.ok(html.includes("Comparação"));
      assert.equal(html.includes("Reprocessar comparação"), statusComparacao === "FALHA");
    }
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});

test("polling conclui, falha, limita tentativas e interrompe sem novas consultas", async () => {
  const controle = new AbortController();
  let consultas = 0;
  const atualizados = [];
  const base = { id: 1, signal: controle.signal, esperar: async () => {}, aoAtualizar: (documento) => atualizados.push(documento) };
  const finalizada = await acompanharComparacao({ ...base, consultar: async () => ({ id: 1, statusValidacao: "PENDENTE", statusComparacao: ++consultas < 3 ? "PROCESSANDO" : "CONCLUIDA", comparacaoCampos: { cpf: "CONFERE" } }) });
  assert.equal(finalizada, "FINALIZADA");
  assert.equal(consultas, 3);
  assert.ok(atualizados.every((documento) => documento.statusValidacao === "PENDENTE"));
  consultas = 0;
  assert.equal(await acompanharComparacao({ ...base, limite: 2, consultar: async () => { consultas += 1; return { statusComparacao: "AGUARDANDO" }; } }), "LIMITE");
  assert.equal(consultas, 2);
  assert.equal(await acompanharComparacao({ ...base, consultar: async () => ({ statusComparacao: "FALHA" }) }), "FINALIZADA");
  await assert.rejects(() => acompanharComparacao({ ...base, consultar: async () => { throw new Error("Sessão expirada"); } }), /Sessão expirada/);
  const espera = esperarComparacao(5000, controle.signal);
  controle.abort();
  await assert.rejects(() => espera, { name: "AbortError" });
  consultas = 0;
  assert.equal(await acompanharComparacao({ ...base, consultar: async () => { consultas += 1; } }), "INTERROMPIDA");
  assert.equal(consultas, 0);
  assert.equal(rotuloComparacao(CAMPOS_COMPARACAO, "constructor", "constructor"), "constructor");
});