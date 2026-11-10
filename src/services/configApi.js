/* Configurações da loja e bairros no banco (Supabase).
   O app usa camelCase; o banco usa snake_case. A conversão fica só aqui. */
import { obterSupabase } from "../lib/supabase";
import { falharSe } from "./erros";

/** Linha de configuracoes → objeto do app */
const configDeBanco = (linha) => ({
  textos: linha.textos,
  beneficios: linha.beneficios,
  pagamentos: linha.pagamentos,
  aviso: linha.aviso,
  pedidosPausados: linha.pedidos_pausados
});

/** Linha de bairros → objeto do app (taxa null = a combinar) */
const bairroDeBanco = (linha) => ({
  nome: linha.nome,
  taxa: linha.taxa === null ? null : Number(linha.taxa),
  ativo: linha.ativo
});

/** Configurações da loja (null se a linha ainda não existir no banco). */
export async function buscarConfiguracoes() {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase
    .from("configuracoes")
    .select("textos, beneficios, pagamentos, aviso, pedidos_pausados")
    .eq("id", 1)
    .maybeSingle();
  falharSe(error, "carregar as configurações");
  return data && configDeBanco(data);
}

/** Bairros em ordem alfabética. Visitantes recebem só os ativos; a admin recebe todos. */
export async function listarBairros() {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.from("bairros").select("nome, taxa, ativo").order("nome");
  falharSe(error, "carregar os bairros");
  return data.map(bairroDeBanco);
}

/** Salva as configurações (só funciona logado como admin). */
export async function salvarConfiguracoes(config) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase
    .from("configuracoes")
    .update({
      textos: config.textos,
      beneficios: config.beneficios,
      pagamentos: config.pagamentos,
      aviso: config.aviso.trim(),
      pedidos_pausados: config.pedidosPausados
    })
    .eq("id", 1)
    .select("textos, beneficios, pagamentos, aviso, pedidos_pausados")
    .single();
  falharSe(error, "salvar as configurações");
  return configDeBanco(data);
}

/** Cria ou atualiza um bairro (pelo nome). */
export async function salvarBairro(bairro) {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase
    .from("bairros")
    .upsert({ nome: bairro.nome.trim(), taxa: bairro.taxa, ativo: bairro.ativo })
    .select("nome, taxa, ativo")
    .single();
  falharSe(error, "salvar o bairro");
  return bairroDeBanco(data);
}

export async function excluirBairro(nome) {
  const { supabase } = await obterSupabase();
  const { error } = await supabase.from("bairros").delete().eq("nome", nome);
  falharSe(error, "excluir o bairro");
}
