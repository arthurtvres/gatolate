/* Pedidos no banco (Supabase). As regras de status e valor ficam em utils/pedido.js. */
import { obterSupabase, supabaseConfigurado } from "../lib/supabase";
import { formatarEndereco } from "../utils/formatacao";
import { salvarMeuPedido } from "../utils/meusPedidos";
import { falharSe } from "./erros";

const COM_ITENS = "*, itens:pedido_itens(*)";

/**
 * Registra o pedido feito na loja e devolve { codigo, token }. O servidor gera
 * o código e recalcula os preços pela tabela de produtos (criar_pedido no schema.sql).
 */
export async function registrarPedido({ cliente, itens, taxa }) {
  const { supabasePedidos } = await obterSupabase();
  const { data, error } = await supabasePedidos.rpc("criar_pedido", {
    p_cliente: cliente,
    p_itens: itens,
    p_taxa: taxa
  });
  falharSe(error, "registrar o pedido");
  return data;
}

/** Status do pedido para a página de acompanhamento do cliente (null se o link não existir). */
export async function acompanharPedido(token) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.rpc("acompanhar_pedido", { p_token: token });
  falharSe(error, "carregar o pedido");
  return data;
}

/** Pedidos (com itens) criados a partir de uma data. `desde` null = todos. */
export async function listarPedidos(desde) {
  const { supabase } = await obterSupabase();
  let consulta = supabase.from("pedidos").select(COM_ITENS).order("criado_em", { ascending: false });
  if (desde) consulta = consulta.gte("criado_em", desde.toISOString());
  const { data, error } = await consulta;
  falharSe(error, "carregar os pedidos");
  return data;
}

/** Atualiza campos de um pedido (status, total_final...). */
export async function atualizarPedido(id, campos) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.from("pedidos").update(campos).eq("id", id).select(COM_ITENS).single();
  falharSe(error, "atualizar o pedido");
  return data;
}

/**
 * Chama `aoChegar(pedido)` a cada pedido novo, em tempo real (Supabase Realtime).
 * `aoMudarConexao(status)` recebe "SUBSCRIBED", "CHANNEL_ERROR", "TIMED_OUT" ou "CLOSED".
 * Devolve a função que para de ouvir.
 */
let canaisAbertos = 0;

export async function ouvirPedidosNovos(aoChegar, aoMudarConexao) {
  const { supabase } = await obterSupabase();
  // Nome único: um canal que ainda está fechando não é reaproveitado por engano
  const canal = supabase
    .channel(`pedidos-novos-${++canaisAbertos}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, (evento) => aoChegar(evento.new))
    .subscribe(aoMudarConexao);
  return () => supabase.removeChannel(canal);
}

/** Campos do formulário da loja → formato esperado por criar_pedido. */
function montarRegistro(resumo, dados) {
  return {
    cliente: {
      nome: dados.nome,
      telefone: dados.telefone,
      tipo: dados.tipo,
      endereco: dados.tipo === "entrega" ? formatarEndereco(dados) : "",
      // O servidor busca a taxa por este nome (bairro digitado à mão = a combinar)
      bairro: dados.tipo === "entrega" && !dados.bairroOutro ? dados.bairro : "",
      observacoes: dados.obs,
      pagamento: dados.pagamento
    },
    itens: resumo.itens.map(({ produto, qtd }) => ({ produto_id: produto.id, quantidade: qtd })),
    taxa: resumo.taxa // ignorado pelo banco atualizado; só vale para o schema antigo
  };
}

/**
 * Registra no banco o pedido que acabou de ser montado na loja, sem travar o
 * envio para o WhatsApp (se falhar, o cliente ainda manda o pedido normalmente).
 * resumo: calcularResumo(...) · dados: campos do formulário já limpos
 */
export async function registrarPedidoDaLoja(resumo, dados) {
  if (!supabaseConfigurado) return null; // modo demonstração
  try {
    const registro = await registrarPedido(montarRegistro(resumo, dados));
    // Guarda no navegador para o cliente acompanhar depois
    if (registro?.token) salvarMeuPedido(registro);
    return registro;
  } catch (erro) {
    console.error(erro);
    return null;
  }
}
