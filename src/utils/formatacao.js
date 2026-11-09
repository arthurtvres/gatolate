/* Formatação de dinheiro, textos, telefone e endereço. */

const intlMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 8 → "R$ 8,00" (troca o espaço especial do Intl por um espaço comum). */
export const moeda = (valor) => intlMoeda.format(valor).replace(/\s/g, " ");

/** 45.5 → "45,50" (valor para preencher um campo de texto). */
export const decimal = (valor) => Number(valor).toFixed(2).replace(".", ",");

/**
 * Texto digitado em reais → número. "1.234,50" ou "1234.5" → 1234.5.
 * null se vazio; NaN se não for um valor válido.
 */
export function lerMoeda(texto) {
  const limpo = texto.trim().replace(/[^\d,.-]/g, "");
  if (!limpo) return null;
  const numero = Number(limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo);
  return Number.isFinite(numero) && numero >= 0 ? numero : NaN;
}

/** Sem acentos, sem espaços nas pontas e minúsculo, para buscas ("São" acha "sao"). */
export const normalizar = (texto) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** plural(1, "item", "itens") → "1 item"; plural(3, ...) → "3 itens". */
export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** Máscara de telefone: (11) 98888-7777 ou (11) 3888-7777. */
export function mascararTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** "Rua X, 123 – Bairro Y (apto 4)" */
export function formatarEndereco({ rua, numero, bairro, complemento }) {
  return `${rua}, ${numero} – ${bairro}${complemento ? ` (${complemento})` : ""}`;
}
