import { describe, expect, it } from "vitest";
import { calcularMetricas, inicioDoPeriodo } from "./metricas";

const agora = new Date(2026, 10, 9, 15, 0); // 09/11/2026 15h (horário local)

const pedido = (dia, status, valor, itens = []) => ({
  criado_em: new Date(2026, 10, dia, 12, 0).toISOString(),
  status,
  subtotal: String(valor),
  taxa_entrega: "0",
  total_final: null,
  tem_sob_consulta: false,
  itens
});

describe("inicioDoPeriodo", () => {
  it("'hoje' começa à meia-noite de hoje", () => {
    expect(inicioDoPeriodo("hoje", agora)).toEqual(new Date(2026, 10, 9, 0, 0));
  });

  it("'7d' inclui hoje e os 6 dias anteriores", () => {
    expect(inicioDoPeriodo("7d", agora)).toEqual(new Date(2026, 10, 3, 0, 0));
  });

  it("'tudo' não tem início", () => {
    expect(inicioDoPeriodo("tudo", agora)).toBeNull();
  });
});

describe("calcularMetricas", () => {
  const pedidos = [
    pedido(9, "entregue", 30, [{ produto_id: "tradicional", nome: "Tradicional", quantidade: 3, subtotal: "24" }]),
    pedido(8, "confirmado", 10, [{ produto_id: "especial", nome: "Especiais", quantidade: 1, subtotal: "12" }]),
    pedido(8, "pendente", 50),
    pedido(7, "cancelado", 99),
    pedido(1, "entregue", 1000) // fora dos 7 dias
  ];

  it("conta como venda só confirmados em diante, dentro do período", () => {
    const m = calcularMetricas(pedidos, "7d", agora);
    expect(m.vendas).toBe(2);
    expect(m.faturamento).toBe(40);
    expect(m.ticketMedio).toBe(20);
    expect(m.pendentes).toBe(1);
    expect(m.totalPedidos).toBe(4);
  });

  it("série tem um ponto por dia, inclusive dias sem venda", () => {
    const { serie } = calcularMetricas(pedidos, "7d", agora);
    expect(serie.agrupamento).toBe("dia");
    expect(serie.pontos).toHaveLength(7);
    expect(serie.pontos.at(-1)).toMatchObject({ valor: 30, vendas: 1 });
  });

  it("ranking ordena os produtos por quantidade vendida", () => {
    const { ranking } = calcularMetricas(pedidos, "7d", agora);
    expect(ranking.map((r) => r.id)).toEqual(["tradicional", "especial"]);
  });
});
