/* Cálculos do carrinho (funções puras, sem React).
   O carrinho é só um objeto { idDoProduto: quantidade }. */
import { moeda } from "./formatacao";
import { temPreco } from "./produtos";

export const QTD_MAXIMA = 99;

/** Limpa um carrinho salvo: mantém só quantidades válidas. */
export function sanitizarCarrinho(salvo) {
  const limpo = {};
  Object.entries(salvo || {}).forEach(([id, qtd]) => {
    if (Number.isInteger(qtd) && qtd > 0) limpo[id] = Math.min(qtd, QTD_MAXIMA);
  });
  return limpo;
}

/**
 * Todos os cálculos num lugar só.
 * produtosPorId: Map id → produto (itens de produtos que não existem mais são ignorados).
 * tipo: "entrega", "retirada" ou nada (ainda não escolhido).
 * taxaEntrega: taxa do bairro escolhido (null = a combinar). Só conta na entrega.
 * O servidor recalcula a taxa pela tabela de bairros; aqui é só para mostrar.
 */
export function calcularResumo(itens, produtosPorId, tipo, taxaEntrega = null) {
  const lista = Object.entries(itens)
    .filter(([id]) => produtosPorId.has(id))
    .map(([id, qtd]) => {
      const produto = produtosPorId.get(id);
      return { produto, qtd, subtotal: temPreco(produto) ? produto.preco * qtd : null };
    });
  const subtotal = lista.reduce((soma, item) => soma + (item.subtotal || 0), 0);
  const taxa = tipo === "entrega" && taxaEntrega > 0 ? taxaEntrega : 0;
  return {
    itens: lista,
    quantidade: lista.reduce((soma, item) => soma + item.qtd, 0),
    subtotal,
    taxa,
    total: subtotal + taxa,
    sobConsulta: lista.some((item) => item.subtotal === null),
    temValor: lista.some((item) => item.subtotal !== null)
  };
}

/** "R$ 28,00" ou "Sob consulta" (quando só há itens sem preço). */
export const textoTotal = (r) => (r.temValor || r.taxa ? moeda(r.total) : "Sob consulta");

/**
 * Observação embaixo do total (itens sob consulta e entrega).
 * taxasPorBairro: algum bairro tem taxa definida · bairro: bairro já escolhido ("" = ainda não)
 */
export function textoNota(r, tipo, { taxasPorBairro = false, bairro = "" } = {}) {
  const partes = [];
  if (r.sobConsulta && r.temValor) partes.push("+ itens sob consulta");
  if (tipo === "entrega") {
    if (r.taxa) partes.push(`Inclui entrega de ${moeda(r.taxa)}`);
    else partes.push(taxasPorBairro && !bairro ? "Taxa de entrega conforme o bairro" : "Taxa de entrega a combinar");
  } else if (!tipo) {
    partes.push(taxasPorBairro ? "Entrega: taxa conforme o bairro" : "Entrega a combinar pelo WhatsApp");
  }
  return partes.join(" · ");
}
