/* Formas de pagamento do config. */
import { normalizar } from "./formatacao";

/** "Cartão" → "Cartão na entrega" / "Cartão na retirada" (para quem tem naEntrega: true). */
export const nomePagamento = (pagamento, tipo) =>
  pagamento.naEntrega ? `${pagamento.nome} na ${tipo === "retirada" ? "retirada" : "entrega"}` : pagamento.nome;

/** Ícone de cada forma de pagamento pelo nome (cartão é o padrão). */
export function iconePagamento(pagamento) {
  const nome = normalizar(pagamento.nome);
  if (nome.includes("pix")) return "pix";
  if (nome.includes("dinheiro")) return "dinheiro";
  return "pagamento";
}
