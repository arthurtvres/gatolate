import { useEffect, useState } from "react";
import { obterSupabase } from "../../lib/supabase";
import { ehAdmin } from "../../services/authApi";

/**
 * Situação do login no painel:
 * "carregando" → "deslogado" | "sem-acesso" (logado, mas não é admin) | "admin"
 */
export function useSessaoAdmin() {
  const [sessao, setSessao] = useState({ status: "carregando", email: "" });

  useEffect(() => {
    let ativo = true;

    async function verificar(sessaoAtual) {
      if (!sessaoAtual) {
        if (ativo) setSessao({ status: "deslogado", email: "" });
        return;
      }
      let admin = false;
      try {
        admin = await ehAdmin();
      } catch (erro) {
        console.error(erro);
      }
      if (ativo) setSessao({ status: admin ? "admin" : "sem-acesso", email: sessaoAtual.user.email });
    }

    // Dispara já com a sessão atual (INITIAL_SESSION) e depois a cada login/logout.
    // A consulta roda fora do callback, como a biblioteca do Supabase recomenda.
    let cancelarInscricao = () => {};
    obterSupabase().then(({ supabase }) => {
      if (!ativo) return;
      const { data } = supabase.auth.onAuthStateChange((_evento, sessaoAtual) => {
        setTimeout(() => verificar(sessaoAtual), 0);
      });
      cancelarInscricao = () => data.subscription.unsubscribe();
    });

    return () => {
      ativo = false;
      cancelarInscricao();
    };
  }, []);

  return sessao;
}
