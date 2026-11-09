/* Regras do pedido (funções puras): etapas, nomes de status e valor. */

/** Nomes curtos dos status (abas e etiquetas do painel). */
export const STATUS = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "Em preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado"
};

/** Caminho normal do pedido, em ordem (cancelado fica de fora: pode acontecer a qualquer momento). */
export const ETAPAS = ["pendente", "confirmado", "preparando", "pronto", "entregue"];

/** Status que contam como venda no faturamento. */
export const STATUS_VENDA = ["confirmado", "preparando", "pronto", "entregue"];

export const ehEntrega = (tipo) => tipo === "entrega";

/** Pedido finalizado: não muda mais (a não ser que a admin reabra). */
export const statusFinal = (status) => status === "entregue" || status === "cancelado";

/** Próxima etapa (null se já terminou ou foi cancelado). */
export function proximoStatus(status) {
  const i = ETAPAS.indexOf(status);
  return i >= 0 && i < ETAPAS.length - 1 ? ETAPAS[i + 1] : null;
}

/** Etapa anterior (para desfazer um clique errado). */
export function statusAnterior(status) {
  const i = ETAPAS.indexOf(status);
  return i > 0 ? ETAPAS[i - 1] : null;
}

/** Nome do status para o tipo do pedido: "pronto" vira "Saiu para entrega" ou "Pronto para retirada". */
export function nomeStatus(status, tipo) {
  const entrega = ehEntrega(tipo);
  if (status === "pronto") return entrega ? "Saiu para entrega" : "Pronto para retirada";
  if (status === "entregue") return entrega ? "Entregue" : "Retirado";
  return STATUS[status] || status;
}

/** Nome do status para o cliente (acompanhamento): "pendente" vira "Pedido recebido". */
export const nomeStatusCliente = (status, tipo) => (status === "pendente" ? "Pedido recebido" : nomeStatus(status, tipo));

/** true se o pedido tem item sob consulta e a admin ainda não definiu o valor final. */
export const faltaValorFinal = (pedido) => pedido.tem_sob_consulta && pedido.total_final === null;

/** Valor do pedido: o ajustado pela admin ou itens + entrega. */
export const valorPedido = (pedido) =>
  pedido.total_final !== null && pedido.total_final !== undefined
    ? Number(pedido.total_final)
    : Number(pedido.subtotal) + Number(pedido.taxa_entrega);
