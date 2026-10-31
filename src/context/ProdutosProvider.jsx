/* Produtos da loja.
   • Com Supabase: vêm do banco (editados no /admin). Mostra primeiro a última
     lista guardada no navegador (abre rápido e funciona com internet instável)
     e atualiza em seguida.
   • Sem Supabase (modo demonstração): vêm do src/config/loja.js. */
import { useCallback, useEffect, useMemo, useState } from "react";
import CONFIG from "../config/loja";
import { supabaseConfigurado } from "../lib/supabase";
import { listarProdutosAtivos } from "../services/produtosApi";
import { CHAVES, gravarLocal, lerLocal } from "../utils/armazenamento";
import { ProdutosContext } from "./contextos";

const produtosDoConfig = () => CONFIG.produtos.map((p) => ({ ativo: true, ordem: 0, informacoes: [], ...p }));

function estadoInicial() {
  if (!supabaseConfigurado) return { produtos: produtosDoConfig(), carregando: false, erro: "" };
  const guardados = lerLocal(CHAVES.produtos, null);
  return Array.isArray(guardados)
    ? { produtos: guardados, carregando: false, erro: "" }
    : { produtos: [], carregando: true, erro: "" };
}

export function ProdutosProvider({ children }) {
  const [estado, setEstado] = useState(estadoInicial);

  const recarregar = useCallback(async () => {
    if (!supabaseConfigurado) return;
    try {
      const produtos = await listarProdutosAtivos();
      gravarLocal(CHAVES.produtos, produtos);
      setEstado({ produtos, carregando: false, erro: "" });
    } catch (erro) {
      console.error(erro);
      // Com uma lista guardada, segue com ela; sem nada, mostra o erro
      setEstado((atual) => ({ ...atual, carregando: false, erro: atual.produtos.length ? "" : erro.message }));
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const valor = useMemo(
    () => ({
      ...estado,
      porId: new Map(estado.produtos.map((p) => [p.id, p])),
      recarregar
    }),
    [estado, recarregar]
  );

  return <ProdutosContext.Provider value={valor}>{children}</ProdutosContext.Provider>;
}
