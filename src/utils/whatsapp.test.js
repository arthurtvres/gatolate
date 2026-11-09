import { afterEach, describe, expect, it, vi } from "vitest";
import CONFIG from "../config/loja";
import { calcularResumo } from "./carrinho";
import { linkWhatsApp, linkWhatsAppCliente, montarMensagem } from "./whatsapp";

const produtos = new Map([
  ["tradicional", { id: "tradicional", nome: "Tradicional", preco: 8 }],
  ["caixa", { id: "caixa", nome: "Pedidos", preco: null, nomeNoPedido: "Caixa personalizada" }]
]);

const dados = {
  nome: "Maria",
  telefone: "(99) 98888-7777",
  tipo: "entrega",
  rua: "Rua A",
  numero: "10",
  bairro: "Centro",
  complemento: "",
  pagamento: "Pix",
  obs: ""
};

afterEach(() => vi.unstubAllGlobals());

describe("links", () => {
  it("link da loja leva o número do config e a mensagem codificada", () => {
    const numero = String(CONFIG.whatsapp).replace(/\D/g, "");
    expect(linkWhatsApp("Olá & tchau")).toBe(`https://wa.me/${numero}?text=Ol%C3%A1%20%26%20tchau`);
  });

  it("link do cliente adiciona o 55 e tira a máscara", () => {
    expect(linkWhatsAppCliente("(99) 98888-7777")).toBe("https://wa.me/5599988887777");
  });
});

describe("mensagem do pedido", () => {
  it("traz itens, total, cliente, entrega e pagamento", () => {
    const resumo = calcularResumo({ tradicional: 2 }, produtos, "entrega");
    const texto = montarMensagem(resumo, dados, "0012");

    expect(texto).toContain("🧾 Pedido #0012");
    expect(texto).toContain("2x Tradicional — R$ 16,00");
    expect(texto).toContain("💰 Total: R$ 16,00");
    expect(texto).toContain("👤 Nome: Maria");
    expect(texto).toContain("🚚 Entrega: Rua A, 10 – Centro");
    expect(texto).toContain("💳 Pagamento: Pix");
    expect(texto).not.toContain("Observações");
  });

  it("usa o nome do pedido e marca itens sob consulta", () => {
    const resumo = calcularResumo({ tradicional: 1, caixa: 1 }, produtos, "retirada");
    const texto = montarMensagem(resumo, { ...dados, tipo: "retirada" });

    expect(texto).toContain("1x Caixa personalizada — sob consulta");
    expect(texto).toContain("(+ itens sob consulta)");
    expect(texto).toContain("🏠 Retirada no local");
  });

  it("inclui o link de acompanhamento quando há token", () => {
    vi.stubGlobal("window", { location: { origin: "https://gatolate.com.br" } });
    const resumo = calcularResumo({ tradicional: 1 }, produtos, "retirada");
    expect(montarMensagem(resumo, dados, "0012", "abc")).toContain(
      "📍 Acompanhe seu pedido: https://gatolate.com.br/pedido/abc"
    );
  });
});
