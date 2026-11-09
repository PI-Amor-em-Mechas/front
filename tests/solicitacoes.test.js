import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";

test("indicador usa verde para ativa e cinza para solicitações encerradas", async () => {
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
  try {
    const { StatusSolicitacao } = await servidor.ssrLoadModule("/src/componentes/DashboardSolicitacoes/DashboardSolicitacoes.jsx");
    for (const [status, rotulo] of [["ATIVA", "Ativa"], ["CONCLUIDA", "Concluída"], ["CANCELADA", "Cancelada"]]) {
      const html = renderToStaticMarkup(createElement(StatusSolicitacao, { status }));
      assert.match(html, new RegExp(`class="solicitacoes-status" data-status="${status}"`));
      assert.ok(html.includes(rotulo));
    }
    const css = await readFile(new URL("../src/componentes/DashboardSolicitacoes/DashboardSolicitacoes.css", import.meta.url), "utf8");
    assert.match(css, /\.solicitacoes-status\s*\{[^}]*color:\s*#475467;[^}]*background:\s*#f2f4f7;/);
    assert.match(css, /\.solicitacoes-status\[data-status="ATIVA"\]\s*\{[^}]*color:\s*#166534;[^}]*background:\s*#dcfce7;/);
  } finally {
    await servidor.close();
  }
});

test("solicitações usam busca e paginação na API, carregam detalhes e persistem status", async () => {
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
  globalThis.sessionStorage = { getItem: () => null };
  try {
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    const { listarSolicitacoesAtivas, buscarSolicitacao, encerrarSolicitacao } = await servidor.ssrLoadModule("/src/services/solicitacoesAdminService.js");
    const chamadas = [];
    api.defaults.adapter = async (config) => {
      chamadas.push(config);
      return { data: { id: 25, status: config.method === "patch" ? JSON.parse(config.data).status : "ATIVA" }, status: 200, statusText: "OK", headers: {}, config };
    };
    await listarSolicitacoesAtivas({ page: 2, size: 20, busca: "Maria" });
    assert.equal(chamadas[0].url, "/solicitacoes");
    assert.deepEqual(chamadas[0].params, { page: 2, size: 20, busca: "Maria" });
    assert.equal((await buscarSolicitacao(25)).status, "ATIVA");
    assert.equal(chamadas[1].url, "/solicitacoes/25");
    assert.equal((await encerrarSolicitacao(25, "CONCLUIDA")).status, "CONCLUIDA");
    assert.equal(chamadas[2].method, "patch");
    assert.equal(chamadas[2].url, "/solicitacoes/25/status");
    api.defaults.adapter = async () => { throw new Error("Falha de rede"); };
    await assert.rejects(() => listarSolicitacoesAtivas(), /Falha de rede/);
    await assert.rejects(() => buscarSolicitacao(25), /Falha de rede/);
    await assert.rejects(() => encerrarSolicitacao(25, "CANCELADA"), /Falha de rede/);
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});

test("mensagens distinguem acesso negado, pedido ausente e encerramento concorrente", async () => {
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
  try {
    const { mensagemErroSolicitacao } = await servidor.ssrLoadModule("/src/services/solicitacoesAdminService.js");
    for (const [status, mensagem] of [[401, /Sessão expirada/], [403, /permissão/], [404, /não encontrada/], [409, /outro atendimento/]]) {
      assert.match(mensagemErroSolicitacao({ response: { status } }), mensagem);
    }
    assert.match(mensagemErroSolicitacao(new Error("offline")), /Tente novamente/);
  } finally {
    await servidor.close();
  }
});

test("menu administrativo referencia solicitações e identifica a página ativa", async () => {
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
  globalThis.sessionStorage = { getItem: () => null };
  try {
    const { default: Navbar } = await servidor.ssrLoadModule("/src/componentes/Navbar/Navbar.jsx");
    for (const pagina of ["envios", "pacientes", "madrinhas", "documentos", "solicitacoes"]) {
      const html = renderToStaticMarkup(createElement(Navbar, { pagina, irParaSolicitacoes: () => {} }));
      assert.match(html, /Solicitações/);
      if (pagina === "solicitacoes") assert.match(html, /aria-current="page"[^>]*>Solicitações/);
    }
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});
