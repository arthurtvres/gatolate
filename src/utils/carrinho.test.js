import { describe, expect, it } from "vitest";
import { calcularResumo, QTD_MAXIMA, sanitizarCarrinho, textoTotal } from "./carrinho";

const produtos = new Map([
  ["tradicional", { id: "tradicional", nome: "Tradicional", preco: 8 }],
  ["especial", { id: "especial", nome: "Especiais", preco: 12 }],
  ["caixa", { id: "caixa", nome: "Pedidos", preco: null }]
]);

describe("sanitizarCarrinho", () => {
  it("mantém só quantidades inteiras positivas, com teto", () => {
    expect(sanitizarCarrinho({ a: 2, b: 0, c: -1, d: 1.5, e: "3", f: 500 })).toEqual({ a: 2, f: QTD_MAXIMA });
  });

  it("aguenta lixo salvo no navegador", () => {
    expect(sanitizarCarrinho(null)).toEqual({});
  });
});

describe("calcularResumo", () => {
  it("soma itens com preço", () => {
    const r = calcularResumo({ tradicional: 2, especial: 1 }, produtos, "retirada");
    expect(r.subtotal).toBe(28);
    expect(r.total).toBe(28);
    expect(r.quantidade).toBe(3);
    expect(r.sobConsulta).toBe(false);
  });

  it("item sob consulta não entra na soma, mas é sinalizado", () => {
    const r = calcularResumo({ tradicional: 1, caixa: 1 }, produtos, "retirada");
    expect(r.subtotal).toBe(8);
    expect(r.sobConsulta).toBe(true);
    expect(r.temValor).toBe(true);
  });

  it("ignora produtos que saíram da loja", () => {
    const r = calcularResumo({ sumiu: 3, tradicional: 1 }, produtos, "retirada");
    expect(r.itens).toHaveLength(1);
    expect(r.quantidade).toBe(1);
  });

  it("retirada nunca tem taxa", () => {
    expect(calcularResumo({ tradicional: 1 }, produtos, "retirada").taxa).toBe(0);
  });
});

describe("textoTotal", () => {
  it("só itens sob consulta mostra 'Sob consulta'", () => {
    expect(textoTotal(calcularResumo({ caixa: 1 }, produtos, "retirada"))).toBe("Sob consulta");
  });

  it("com valor mostra em reais", () => {
    expect(textoTotal(calcularResumo({ tradicional: 2 }, produtos, "retirada"))).toBe("R$ 16,00");
  });
});
