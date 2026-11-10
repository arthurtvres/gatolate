/* Valores em reais digitados no painel ("7,50" ↔ 7.5). */

/** "7,50" → 7.5 · "" → null (vazio = a combinar) · texto inválido → NaN */
export function lerReais(texto) {
  const limpo = String(texto ?? "").trim().replace(/^R\$\s*/i, "");
  if (!limpo) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$|^\d+(\.\d{1,2})$/.test(limpo)) return NaN;
  // "7.50" (ponto como decimal) também vale; "1.000,00" usa ponto como milhar
  const numero = /,/.test(limpo) || /\.\d{3}$/.test(limpo) ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return Number(numero);
}

/** 7.5 → "7,50" · null → "" */
export const paraCampoReais = (valor) => (typeof valor === "number" ? valor.toFixed(2).replace(".", ",") : "");
