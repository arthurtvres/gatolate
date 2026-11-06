/* Pedidos no banco (Supabase). */
import { obterSupabase, supabaseConfigurado } from "../lib/supabase";
import { formatarEndereco } from "../utils/whatsapp";

export const STATUS = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  entregue: "Entregue",
  cancelado: "Cancelado"
};

/** Status que contam como venda no faturamento. */
export const STATUS_VENDA = ["confirmado", "entregue"];

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
  }).catch((erro) => {
    console.error(erro);
    return null;
  });
}
