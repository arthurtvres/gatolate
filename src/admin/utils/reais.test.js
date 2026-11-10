import { describe, expect, it } from "vitest";
import { lerReais, paraCampoReais } from "./reais";

describe("lerReais", () => {
  it("lê valores com vírgula, ponto ou inteiros", () => {
    expect(lerReais("7,50")).toBe(7.5);
    expect(lerReais("7.50")).toBe(7.5);
    expect(lerReais("8")).toBe(8);
    expect(lerReais("R$ 12,00")).toBe(12);
    expect(lerReais("1.000,00")).toBe(1000);
  });

  it("vazio significa a combinar (null)", () => {
    expect(lerReais("")).toBeNull();
    expect(lerReais("   ")).toBeNull();
  });

  it("texto que não é valor vira NaN", () => {
    expect(lerReais("abc")).toBeNaN();
    expect(lerReais("7,555")).toBeNaN();
    expect(lerReais("-5")).toBeNaN();
  });
});

describe("paraCampoReais", () => {
  it("mostra o valor com vírgula, ou vazio quando é a combinar", () => {
    expect(paraCampoReais(7.5)).toBe("7,50");
    expect(paraCampoReais(null)).toBe("");
  });
});
