import { describe, expect, it } from "vitest";
import { validarCampo, validarFormulario } from "./validacao";

const entregaValida = {
  nome: "Maria",
  telefone: "(99) 98888-7777",
  tipo: "entrega",
  rua: "Rua A",
  numero: "10",
  bairro: "Centro",
  bairroOutro: false
};

describe("formulário de pedido", () => {
  it("entrega completa não tem erros", () => {
    expect(validarFormulario(entregaValida)).toEqual({});
  });

  it("retirada não exige endereço", () => {
    expect(validarFormulario({ nome: "Maria", telefone: "99988887777", tipo: "retirada" })).toEqual({});
  });

  it("aponta todos os campos que faltam na entrega", () => {
    const erros = validarFormulario({ tipo: "entrega" });
    expect(Object.keys(erros).sort()).toEqual(["bairro", "nome", "numero", "rua", "telefone"]);
  });
});

describe("telefone", () => {
  it("aceita 10 ou 11 dígitos, com ou sem máscara", () => {
    expect(validarCampo("telefone", { telefone: "9938887777" })).toBe("");
    expect(validarCampo("telefone", { telefone: "(99) 98888-7777" })).toBe("");
  });

  it("recusa número curto ou longo", () => {
    expect(validarCampo("telefone", { telefone: "123" })).not.toBe("");
    expect(validarCampo("telefone", { telefone: "999888877776" })).not.toBe("");
  });
});

describe("bairro", () => {
  it("precisa ser da lista, a não ser que a pessoa escolha digitar livre", () => {
    expect(validarCampo("bairro", { ...entregaValida, bairro: "Bairro Inventado" })).not.toBe("");
    expect(validarCampo("bairro", { ...entregaValida, bairro: "Bairro Inventado", bairroOutro: true })).toBe("");
  });
});
