export const LIMITE_ARQUIVO = 10 * 1024 * 1024;

const FORMATOS = {
  pdf: { mime: "application/pdf", assinatura: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  jpg: { mime: "image/jpeg", assinatura: [0xff, 0xd8, 0xff] },
  jpeg: { mime: "image/jpeg", assinatura: [0xff, 0xd8, 0xff] },
  png: { mime: "image/png", assinatura: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
};

export async function validarArquivo(arquivo) {
  if (!arquivo || arquivo.size === 0) throw new Error("Selecione um arquivo que não esteja vazio.");
  if (arquivo.size > LIMITE_ARQUIVO) throw new Error("O arquivo deve ter no máximo 10 MB.");
  const extensao = arquivo.name.split(".").pop().toLowerCase();
  if (!Object.hasOwn(FORMATOS, extensao)) throw new Error("Tipo inválido. Envie PDF, JPG/JPEG ou PNG.");
  const formato = FORMATOS[extensao];
  const bytes = new Uint8Array(await arquivo.slice(0, 8).arrayBuffer());
  if (!formato.assinatura.every((byte, indice) => bytes[indice] === byte) ||
      (arquivo.type && arquivo.type !== formato.mime)) {
    throw new Error("A extensão não corresponde ao conteúdo do arquivo.");
  }
  const base = arquivo.name.slice(0, -(extensao.length + 1)).slice(0, 200)
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "_").split("_").filter(Boolean).join("_").slice(0, 100);
  const nome = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base) ? `documento_${base}` : base;
  return new File([arquivo], `${nome || "documento"}.${extensao}`, {
    type: formato.mime, lastModified: arquivo.lastModified,
  });
}