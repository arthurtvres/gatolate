import { describe, expect, it } from "vitest";
import {
  faltaValorFinal,
  nomeStatus,
  nomeStatusCliente,
  proximoStatus,
  statusAnterior,
  statusFinal,
  valorPedido
} from "./pedido";

describe("etapas do pedido", () => {
  it("avança na ordem pendente → confirmado → preparando → pronto → entregue", () => {
    expect(proximoStatus("pendente")).toBe("confirmado");
    expect(proximoStatus("pronto")).toBe("entregue");
    expect(proximoStatus("entregue")).toBeNull();
  });

  it("cancelado não tem próxima nem anterior", () => {
    expect(proximoStatus("cancelado")).toBeNull();
    expect(statusAnterior("cancelado")).toBeNull();
  });

  it("volta uma etapa, mas não antes de pendente", () => {
    expect(statusAnterior("preparando")).toBe("confirmado");
    expect(statusAnterior("pendente")).toBeNull();
  });

  it("entregue e cancelado são finais", () => {
    expect(statusFinal("entregue")).toBe(true);
    expect(statusFinal("cancelado")).toBe(true);
    expect(statusFinal("pronto")).toBe(false);
  });
});

describe("nomes de status", () => {
  it("'pronto' e 'entregue' mudam conforme entrega ou retirada", () => {
    expect(nomeStatus("pronto", "entrega")).toBe("Saiu para entrega");
    expect(nomeStatus("pronto", "retirada")).toBe("Pronto para retirada");
    expect(nomeStatus("entregue", "retirada")).toBe("Retirado");
  });

  it("para o cliente, 'pendente' vira 'Pedido recebido'", () => {
    expect(nomeStatusCliente("pendente", "entrega")).toBe("Pedido recebido");
    expect(nomeStatusCliente("preparando", "entrega")).toBe("Em preparo");
  });
});

describe("valor do pedido", () => {
  const pedido = { subtotal: "20.00", taxa_entrega: "5.00", total_final: null, tem_sob_consulta: false };

  it("soma itens e entrega quando a admin não ajustou", () => {
    expect(valorPedido(pedido)).toBe(25);
  });

  it("usa o valor final da admin quando existe, mesmo zero", () => {
    expect(valorPedido({ ...pedido, total_final: "40.50" })).toBe(40.5);
    expect(valorPedido({ ...pedido, total_final: 0 })).toBe(0);
  });

  it("falta valor final só com item sob consulta e sem ajuste", () => {
    expect(faltaValorFinal({ ...pedido, tem_sob_consulta: true })).toBe(true);
    expect(faltaValorFinal({ ...pedido, tem_sob_consulta: true, total_final: "30" })).toBe(false);
    expect(faltaValorFinal(pedido)).toBe(false);
  });
});
