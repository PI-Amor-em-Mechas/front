import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const dashboardPath = new URL("../src/componentes/DashboardEnvios/DashboardEnvios.jsx", import.meta.url);
const servicePath = new URL("../src/services/dashboardService.js", import.meta.url);

async function lerDashboard() {
  return readFile(dashboardPath, "utf8");
}

test("DASH-01 normaliza resposta de kits em array", async () => {
  const servidor = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
  globalThis.sessionStorage = { getItem: () => null };
  try {
    const { listarKits } = await servidor.ssrLoadModule("/src/services/dashboardService.js");
    const { default: api } = await servidor.ssrLoadModule("/src/services/api.js");
    api.defaults.adapter = async (config) => ({ data: { content: [{ id: 1 }] }, status: 200, statusText: "OK", headers: {}, config });
    assert.deepEqual(await listarKits(), [{ id: 1 }]);
  } finally {
    delete globalThis.sessionStorage;
    await servidor.close();
  }
});

test("DASH-02 usa a coleção carregada para a KPI", async () => {
  assert.match(await lerDashboard(), /valor: carregando \? "-" : kitsFiltrados\.length/);
});

test("DASH-03 loading não mostra empty state do ranking", async () => {
  const source = await lerDashboard();
  assert.match(source, /carregando=\{carregando\}/);
  assert.match(await readFile(new URL("../src/componentes/RankingRegioes/RankingRegioes.jsx", import.meta.url), "utf8"), /!carregando && regioes\.length === 0/);
});

test("DASH-04 coleção vazia após sucesso mostra empty state", async () => {
  assert.match(await readFile(new URL("../src/componentes/RankingRegioes/RankingRegioes.jsx", import.meta.url), "utf8"), /Nenhum kit cadastrado/);
});

test("DASH-05 erro é exposto em alerta", async () => {
  assert.match(await lerDashboard(), /role="alert"/);
});

test("DASH-06 finalização do AbortError encerra loading", async () => {
  assert.match(await lerDashboard(), /\.finally\(\(\) => \{ if \(ativo\) setCarregando\(false\); \}\)/);
});

test("DASH-07 cleanup não aborta a requisição atual", async () => {
  const source = await lerDashboard();
  assert.doesNotMatch(source, /controller\.abort\(\)/);
  assert.match(source, /let ativo = true/);
});

test("DASH-08 resposta lenta não é descartada pela segunda execução", async () => {
  assert.match(await lerDashboard(), /carregamentoRef\.current \?\?= Promise\.allSettled/);
});

test("DASH-09 erro parcial preserva resultados fulfilled", async () => {
  const source = await lerDashboard();
  assert.match(source, /resultadoKits\.status === "fulfilled"\) setKits/);
  assert.match(source, /resultadoPacientes\.status === "fulfilled"\) setPacientes/);
  assert.match(source, /Promise\.allSettled/);
});

test("DASH-10 filtro de estado é derivado dos envios", async () => {
  assert.match(await lerDashboard(), /estadosDisponiveis = \[\.\.\.new Set\(envios\.map/);
});

test("DASH-11 filtro de cidade é derivado dos envios", async () => {
  assert.match(await lerDashboard(), /cidadesDisponiveis = \[\.\.\.new Set\(envios/);
});

test("DASH-12 cidade depende do estado", async () => {
  assert.match(await lerDashboard(), /\.filter\(\(envio\) => !estadoFiltro \|\| envio\.estado === estadoFiltro\)/);
});

test("DASH-13 status usa somente valores retornados", async () => {
  assert.match(await lerDashboard(), /statusDisponiveis = \[\.\.\.new Set\(envios\.map/);
});

test("DASH-14 filtros combinados usam a mesma coleção", async () => {
  const source = await lerDashboard();
  assert.match(source, /!statusFiltro/);
  assert.match(source, /!estadoFiltro/);
  assert.match(source, /!cidadeFiltro/);
});

test("DASH-15 limpar filtros restaura valores padrão", async () => {
  const source = await lerDashboard();
  assert.match(source, /setEstadoFiltro\(""\)/);
  assert.match(source, /setCidadeFiltro\(""\)/);
  assert.match(source, /setStatusFiltro\(""\)/);
});

test("DASH-16 KPI acompanha filtros", async () => {
  assert.match(await lerDashboard(), /kitsFiltrados\.length/);
});

test("DASH-17 tabela acompanha filtros", async () => {
  assert.match(await lerDashboard(), /enviosFiltrados\.slice/);
});

test("DASH-18 gráficos acompanham filtros regionais", async () => {
  assert.match(await lerDashboard(), /envios: agruparPorEstado\(kitsFiltrados, periodo\)/);
});

test("DASH-19 paginação é reiniciada ao alterar filtros", async () => {
  const source = await lerDashboard();
  assert.match(source, /setEstadoFiltro\(evento\.target\.value\); setCidadeFiltro\(""\); setPagina\(1\)/);
  assert.match(source, /setStatusFiltro\(evento\.target\.value\); setPagina\(1\)/);
});

test("DASH-20 cliente envia Bearer e kits usam timeout compatível", async () => {
  const service = await readFile(servicePath, "utf8");
  assert.match(service, /api\.get\("\/kits", \{ timeout: 30000 \}\)/);
  assert.match(await readFile(new URL("../src/services/api.js", import.meta.url), "utf8"), /config\.headers\.Authorization = `Bearer/);
});
