import { describe, expect, it } from "vitest";
import CONFIG from "../config/loja";
import { configPadrao, mesclarConfig, nomesBairros, taxaDoBairro, temTaxas, textoAviso } from "./configLoja";

const banco = {
  textos: { proposito: "Novo propósito", sobre: ["Parágrafo 1", "Parágrafo 2"] },
  beneficios: [{ icone: "qualidade", titulo: "Feito na hora" }],
  pagamentos: [{ nome: "Pix", naEntrega: false }],
  aviso: "Sem entregas no feriado",
  pedidosPausados: false
};
const bairros = [
  { nome: "Centro", taxa: 5, ativo: true },
  { nome: "Vila Nova", taxa: null, ativo: true },
  { nome: "Longe", taxa: 20, ativo: false }
];

describe("mesclarConfig", () => {
  it("usa o que veio do banco e completa o resto com o padrão do código", () => {
    const c = mesclarConfig(banco, bairros);
    expect(c.textos.proposito).toBe("Novo propósito");
    expect(c.textos.sobre).toEqual(["Parágrafo 1", "Parágrafo 2"]);
    expect(c.textos.momentoLinha1).toBe(CONFIG.textos.momentoLinha1);
    expect(c.pagamentos).toEqual([{ nome: "Pix", naEntrega: false }]);
    expect(c.aviso).toBe("Sem entregas no feriado");
  });

  it("deixa de fora os bairros desativados", () => {
    expect(nomesBairros(mesclarConfig(banco, bairros).bairros)).toEqual(["Centro", "Vila Nova"]);
  });

  it("lista de bairros vazia no banco continua vazia (a dona desativou todos)", () => {
    expect(mesclarConfig(banco, []).bairros).toEqual([]);
  });

  it("sem linha no banco, fica tudo como no código", () => {
    const c = mesclarConfig(null, null);
    expect(c).toEqual(configPadrao());
  });

  it("descarta dados malformados em vez de quebrar a loja", () => {
    const c = mesclarConfig(
      { textos: { proposito: 42, sobre: "não é lista" }, pagamentos: [], beneficios: [{ titulo: 1 }], aviso: null },
      bairros
    );
    expect(c.textos.proposito).toBe(CONFIG.textos.proposito);
    expect(c.textos.sobre).toEqual(CONFIG.textos.sobre);
    expect(c.pagamentos).toEqual(CONFIG.pagamentos);
    expect(c.beneficios).toEqual([]);
    expect(c.aviso).toBe("");
    expect(c.pedidosPausados).toBe(false);
  });
});

describe("taxas por bairro", () => {
  const lista = mesclarConfig(banco, bairros).bairros;

  it("devolve a taxa do bairro, ou null quando é a combinar", () => {
    expect(taxaDoBairro(lista, "Centro")).toBe(5);
    expect(taxaDoBairro(lista, "Vila Nova")).toBeNull();
    expect(taxaDoBairro(lista, "Não existe")).toBeNull();
  });

  it("taxa zero conta como a combinar", () => {
    expect(taxaDoBairro([{ nome: "X", taxa: 0 }], "X")).toBeNull();
  });

  it("temTaxas só é true quando algum bairro tem valor", () => {
    expect(temTaxas(lista)).toBe(true);
    expect(temTaxas([{ nome: "X", taxa: null }])).toBe(false);
  });
});

describe("textoAviso", () => {
  it("mostra o aviso escrito pela dona", () => {
    expect(textoAviso({ aviso: "  Férias até dia 10  ", pedidosPausados: false })).toBe("Férias até dia 10");
  });

  it("loja pausada sem aviso mostra a mensagem padrão", () => {
    expect(textoAviso({ aviso: "", pedidosPausados: true })).toMatch(/não estamos recebendo pedidos/);
  });

  it("sem aviso e sem pausa, não mostra nada", () => {
    expect(textoAviso({ aviso: " ", pedidosPausados: false })).toBe("");
  });
});
