/* Acesso ao Supabase (banco, login e fotos).

   A biblioteca do Supabase é grande, então ela é baixada SOB DEMANDA
   (import dinâmico): a loja aparece primeiro e o Supabase carrega em seguida.
   Use sempre `const { supabase } = await obterSupabase();`.

   Sem as variáveis de ambiente, o site funciona em modo demonstração
   (produtos do config, sem registro de pedidos, /admin indisponível). */

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && chave);

let clientes = null;

/** Cria os clientes uma única vez (na primeira chamada) e devolve { supabase, supabasePedidos }. */
export function obterSupabase() {
  if (!supabaseConfigurado) return Promise.reject(new Error("Supabase não configurado"));
  clientes ??= import("@supabase/supabase-js").then(({ createClient }) => ({
    /** Cliente principal: loja e painel admin (login, produtos, fotos). */
    supabase: createClient(url, chave),
    /**
     * Cliente só para registrar pedidos da loja. Usa `keepalive` para a
     * requisição terminar mesmo se a página for trocada pelo WhatsApp logo em
     * seguida (comum no celular). Fica separado porque `keepalive` limita o
     * envio a 64 KB, o que quebraria o upload de fotos no cliente principal.
     */
    supabasePedidos: createClient(url, chave, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: "gatolate-pedidos" },
      global: { fetch: (recurso, opcoes) => fetch(recurso, { ...opcoes, keepalive: true }) }
    })
  }));
  return clientes;
}
