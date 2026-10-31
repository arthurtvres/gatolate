/* Produtos no banco (Supabase). O app usa nomes em camelCase;
   o banco usa snake_case. A conversão fica só aqui. */
import { obterSupabase } from "../lib/supabase";

const BUCKET_FOTOS = "produtos";

/** Linha do banco → produto do app */
export function deBanco(linha) {
  return {
    id: linha.id,
    nome: linha.nome,
    descricao: linha.descricao || "",
    detalhes: linha.detalhes || "",
    informacoes: linha.informacoes || [],
    preco: linha.preco === null ? null : Number(linha.preco),
    unidade: linha.unidade || "",
    imagem: linha.imagem || "",
    categoria: linha.categoria || "",
    nomeNoPedido: linha.nome_no_pedido || "",
    ativo: linha.ativo,
    ordem: linha.ordem ?? 0
  };
}

/** Produto do app → linha do banco */
function paraBanco(produto) {
  return {
    id: produto.id,
    nome: produto.nome.trim(),
    descricao: produto.descricao.trim(),
    detalhes: produto.detalhes.trim(),
    informacoes: produto.informacoes,
    preco: produto.preco,
    unidade: produto.unidade.trim(),
    imagem: produto.imagem,
    categoria: produto.categoria.trim(),
    nome_no_pedido: produto.nomeNoPedido.trim(),
    ativo: produto.ativo,
    ordem: produto.ordem
  };
}

function falhar(error, acao) {
  if (error) throw new Error(`Não foi possível ${acao}: ${error.message}`);
}

/** Produtos visíveis para os clientes, na ordem definida pela admin. */
export async function listarProdutosAtivos() {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("ordem")
    .order("nome");
  falhar(error, "carregar os produtos");
  return data.map(deBanco);
}

/** Todos os produtos, inclusive os ocultos (só funciona logado como admin). */
export async function listarTodosProdutos() {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.from("produtos").select("*").order("ordem").order("nome");
  falhar(error, "carregar os produtos");
  return data.map(deBanco);
}

/** Cria ou atualiza (pelo id). */
export async function salvarProduto(produto) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.from("produtos").upsert(paraBanco(produto)).select().single();
  falhar(error, "salvar o produto");
  return deBanco(data);
}

export async function alterarAtivo(id, ativo) {
  const { supabase } = await obterSupabase();
  const { error } = await supabase.from("produtos").update({ ativo }).eq("id", id);
  falhar(error, ativo ? "mostrar o produto" : "ocultar o produto");
}

export async function excluirProduto(id) {
  const { supabase } = await obterSupabase();
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  falhar(error, "excluir o produto");
}

/** Envia a foto para o Storage e devolve o link público. */
export async function enviarFoto(arquivo, idProduto) {
  const { supabase } = await obterSupabase();
  const extensao = (arquivo.name.split(".").pop() || "jpg").toLowerCase();
  const caminho = `${idProduto}-${Date.now()}.${extensao}`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(caminho, arquivo, { cacheControl: "31536000", contentType: arquivo.type });
  falhar(error, "enviar a foto");
  return supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
}
