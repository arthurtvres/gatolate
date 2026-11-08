/* Pedidos no banco (Supabase). */
import { obterSupabase, supabaseConfigurado } from "../lib/supabase";
import { salvarMeuPedido } from "../utils/meusPedidos";
import { formatarEndereco } from "../utils/whatsapp";

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
  const entrega = tipo === "entrega";
  if (status === "pronto") return entrega ? "Saiu para entrega" : "Pronto para retirada";
  if (status === "entregue") return entrega ? "Entregue" : "Retirado";
  return STATUS[status] || status;
}

/** Nome do status para o cliente (acompanhamento): "pendente" vira "Pedido recebido". */
export const nomeStatusCliente = (status, tipo) => (status === "pendente" ? "Pedido recebido" : nomeStatus(status, tipo));

/**
 * Registra o pedido feito na loja. O servidor recalcula os preços a partir
 * da tabela de produtos (função criar_pedido no supabase/schema.sql).
 */
export async function registrarPedido({ codigo, cliente, itens, taxa }) {
  const { supabasePedidos } = await obterSupabase();
  const { data, error } = await supabasePedidos.rpc("criar_pedido", {
    p_codigo: codigo,
    p_cliente: cliente,
    p_itens: itens,
    p_taxa: taxa
  });
  if (error) throw new Error(`Não foi possível registrar o pedido: ${error.message}`);
  // Banco antigo (antes do acompanhamento) devolvia só o código
  return typeof data === "string" ? { codigo: data, token: null } : data;
}

/** Status do pedido para a página de acompanhamento do cliente (null se o link não existir). */
export async function acompanharPedido(token) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.rpc("acompanhar_pedido", { p_token: token });
  if (error) throw new Error(`Não foi possível carregar o pedido: ${error.message}`);
  return data;
}

/** Pedidos (com itens) criados a partir de uma data. `desde` null = todos. */
export async function listarPedidos(desde) {
  const { supabase } = await obterSupabase();
  let consulta = supabase
    .from("pedidos")
    .select("*, itens:pedido_itens(*)")
    .order("criado_em", { ascending: false });
  if (desde) consulta = consulta.gte("criado_em", desde.toISOString());
  const { data, error } = await consulta;
  if (error) throw new Error(`Não foi possível carregar os pedidos: ${error.message}`);
  return data;
}

/** Atualiza campos de um pedido (status, total_final...). */
export async function atualizarPedido(id, campos) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase
    .from("pedidos")
    .update(campos)
    .eq("id", id)
    .select("*, itens:pedido_itens(*)")
    .single();
  if (error) throw new Error(`Não foi possível atualizar o pedido: ${error.message}`);
  return data;
}

/** Valor do pedido: o ajustado pela admin ou itens + entrega. */
export const valorPedido = (pedido) =>
  pedido.total_final !== null && pedido.total_final !== undefined
    ? Number(pedido.total_final)
    : Number(pedido.subtotal) + Number(pedido.taxa_entrega);

/**
 * Registra no banco o pedido que acabou de ser montado na loja, sem travar o
 * envio para o WhatsApp (se falhar, o cliente ainda manda o pedido normalmente).
 * resumo: calcularResumo(...) · dados: campos do formulário já limpos
 */
export function registrarPedidoDaLoja(codigo, resumo, dados) {
  if (!supabaseConfigurado) return null; // modo demonstração
  return registrarPedido({
    codigo,
    cliente: {
      nome: dados.nome,
      telefone: dados.telefone,
      tipo: dados.tipo,
      endereco: dados.tipo === "entrega" ? formatarEndereco(dados) : "",
      data: dados.data,
      periodo: dados.periodo,
      observacoes: dados.obs,
      pagamento: dados.pagamento
    },
    itens: resumo.itens.map(({ produto, qtd }) => ({ produto_id: produto.id, quantidade: qtd })),
    taxa: resumo.taxa
  })
    .then((registro) => {
      // Guarda no navegador para o cliente acompanhar depois
      if (registro?.token) salvarMeuPedido(registro);
      return registro;
    })
    .catch((erro) => {
      console.error(erro);
      return null;
    });
}
