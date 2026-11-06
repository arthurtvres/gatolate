/* Formatação de dinheiro, textos, telefone e datas. */

const intlMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 8 → "R$ 8,00" (troca o espaço especial do Intl por um espaço comum). */
export const moeda = (valor) => intlMoeda.format(valor).replace(/\s/g, " ");

/** Remove acentos e deixa minúsculo (a busca acha "recheado" e "Recheados"). */
export const normalizar = (texto) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

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

/** "2026-11-02" → "02/11" */
export function dataCurta(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/** Data de hoje no formato do campo de data ("2026-10-31"), no fuso local. */
export function hojeISO() {
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  return hoje.toISOString().slice(0, 10);
}
