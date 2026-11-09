import { useEffect, useState } from "react";
import { supabaseConfigurado } from "../lib/supabase";
import { acompanharPedido } from "../services/pedidosApi";
import { statusFinal } from "../utils/pedido";

const INTERVALO = 15000; // 15 s

/**
 * Status de um pedido pelo token, atualizado sozinho a cada 15 s
 * (só com a aba visível, e para de perguntar quando o pedido termina).
 * estado: "carregando" | "ok" | "nao-encontrado" | "erro"
 */
export function useAcompanhamento(token) {
  const podeBuscar = Boolean(token) && supabaseConfigurado;
  const [resultado, setResultado] = useState({ estado: podeBuscar ? "carregando" : "nao-encontrado", pedido: null });

  useEffect(() => {
    if (!podeBuscar) return undefined;

    let ativo = true;
    let timer = null;
    let terminou = false;

    async function buscar() {
      clearTimeout(timer);
      try {
        const pedido = await acompanharPedido(token);
        if (!ativo) return;
        setResultado(pedido ? { estado: "ok", pedido } : { estado: "nao-encontrado", pedido: null });
        terminou = !pedido || statusFinal(pedido.status);
      } catch {
        // Falha de rede: mantém o último status que deu certo e tenta de novo
        if (ativo) setResultado((atual) => (atual.pedido ? atual : { estado: "erro", pedido: null }));
      }
      if (ativo && !terminou && document.visibilityState === "visible") timer = setTimeout(buscar, INTERVALO);
    }

    // Voltou para a aba (ex.: depois do WhatsApp): atualiza na hora
    function aoMudarVisibilidade() {
      if (document.visibilityState === "visible" && !terminou) buscar();
      else clearTimeout(timer);
    }

    buscar();
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => {
      ativo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [token, podeBuscar]);

  return resultado;
}
