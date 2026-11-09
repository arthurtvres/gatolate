import { describe, expect, it } from "vitest";
import { decimal, formatarEndereco, lerMoeda, mascararTelefone, moeda, normalizar, plural } from "./formatacao";

describe("dinheiro", () => {
  it("formata em reais com espaço comum", () => {
    expect(moeda(8)).toBe("R$ 8,00");
    expect(moeda(1234.5)).toBe("R$ 1.234,50");
  });

  it("decimal para campo de texto", () => {
    expect(decimal(45.5)).toBe("45,50");
    expect(decimal("12")).toBe("12,00");
  });

  it("lê valores digitados no jeito brasileiro ou com ponto", () => {
    expect(lerMoeda("1.234,50")).toBe(1234.5);
    expect(lerMoeda("R$ 45,00")).toBe(45);
    expect(lerMoeda("12.5")).toBe(12.5);
  });

  it("vazio é null; inválido ou negativo é NaN", () => {
    expect(lerMoeda("   ")).toBeNull();
    expect(lerMoeda("abc,de,fg")).toBeNaN();
    expect(lerMoeda("-5")).toBeNaN();
  });
});

describe("textos", () => {
  it("normaliza para busca: sem acento, minúsculo e sem espaços nas pontas", () => {
    expect(normalizar("  São José  ")).toBe("sao jose");
  });

  it("plural", () => {
    expect(plural(1, "item", "itens")).toBe("1 item");
    expect(plural(3, "item", "itens")).toBe("3 itens");
  });
});

describe("telefone", () => {
  it("aplica a máscara enquanto a pessoa digita", () => {
    expect(mascararTelefone("9")).toBe("(9");
    expect(mascararTelefone("99991")).toBe("(99) 991");
    expect(mascararTelefone("9938887777")).toBe("(99) 3888-7777");
    expect(mascararTelefone("99988887777")).toBe("(99) 98888-7777");
  });

  it("ignora letras e corta no 11º dígito", () => {
    expect(mascararTelefone("(99) 98888-77779999")).toBe("(99) 98888-7777");
    expect(mascararTelefone("abc")).toBe("");
  });
});

describe("endereço", () => {
  it("monta a linha com complemento opcional", () => {
    const base = { rua: "Rua A", numero: "10", bairro: "Centro" };
    expect(formatarEndereco(base)).toBe("Rua A, 10 – Centro");
    expect(formatarEndereco({ ...base, complemento: "apto 2" })).toBe("Rua A, 10 – Centro (apto 2)");
  });
});
