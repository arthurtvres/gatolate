/* Login do painel admin (Supabase Auth). */
import { obterSupabase } from "../lib/supabase";

const MENSAGENS = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Este e-mail ainda não foi confirmado no Supabase."
};

export async function entrar(email, senha) {
  const { supabase } = await obterSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
  if (error) throw new Error(MENSAGENS[error.message] || "Não foi possível entrar. Tente de novo.");
}

export async function sair() {
  const { supabase } = await obterSupabase();
  await supabase.auth.signOut();
}

/** true se o usuário logado está na tabela "admins". */
export async function ehAdmin() {
  const { supabase } = await obterSupabase();
  const { data, error } = await supabase.rpc("eh_admin");
  if (error) throw new Error(error.message);
  return data === true;
}
