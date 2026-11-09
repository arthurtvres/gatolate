import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { ouvirPedidosNovos } from "../../services/pedidosApi";
import { ehEntrega } from "../../utils/pedido";
import { caminhoPublico } from "../../utils/produtos";
import { destravarSom, notificar, tocarAviso } from "../utils/avisos";

const PAGINA_PEDIDOS = "/admin/pedidos";

/** Número que muda a cada pedido novo: as páginas usam para recarregar as listas. */
export const VersaoPedidosContext = createContext(0);
export const useVersaoPedidos = () => useContext(VersaoPedidosContext);

const primeiroNome = (nome = "") => nome.trim().split(/\s+/)[0];

/** Libera o som no primeiro clique ou tecla (regra dos navegadores). */
function useDestravarSom() {
  useEffect(() => {
    const eventos = ["pointerdown", "keydown"];
    eventos.forEach((evento) => document.addEventListener(evento, destravarSom, { once: true }));
    return () => eventos.forEach((evento) => document.removeEventListener(evento, destravarSom));
  }, []);
}

/** "(2) Painel": mostra os pedidos não vistos no título da aba. */
function useContadorNoTitulo(quantidade) {
  const tituloOriginal = useRef(document.title);
  useEffect(() => {
    const original = tituloOriginal.current;
    document.title = quantidade ? `(${quantidade}) Pedido novo! · Painel` : original;
    return () => {
      document.title = original;
    };
  }, [quantidade]);
}

/**
 * Avisa a admin de cada pedido novo, em tempo real: som, aviso na tela,
 * notificação do sistema (com o painel em segundo plano) e contador de não vistos.
 * Os não vistos zeram quando a página de pedidos está na tela.
 * Devolve { naoVistos, versao }.
 */
export function useAvisosPedidos() {
  const mostrarToast = useToast();
  const navigate = useNavigate();
  // O canal fica aberto o tempo todo; o ref evita reconectar a cada troca de página
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  });
  const { pathname } = useLocation();
  const [naoVistos, setNaoVistos] = useState(0);
  const [versao, setVersao] = useState(0);

  useDestravarSom();
  useContadorNoTitulo(naoVistos);

  useEffect(() => {
    let ativo = true;
    let pararDeOuvir = () => {};
    let jaConectou = false;

    function aoChegar(pedido) {
      setNaoVistos((n) => n + 1);
      setVersao((v) => v + 1);
      tocarAviso();
      const quem = primeiroNome(pedido.cliente_nome);
      mostrarToast(`🔔 Pedido novo #${pedido.codigo} · ${quem}`);
      notificar({
        titulo: `Pedido novo #${pedido.codigo}`,
        corpo: `${quem} · ${ehEntrega(pedido.tipo) ? "Entrega" : "Retirada"}`,
        etiqueta: `pedido-${pedido.id}`,
        icone: caminhoPublico("logo.png"),
        aoClicar: () => navigateRef.current(PAGINA_PEDIDOS)
      });
    }

    function aoMudarConexao(status) {
      if (status === "SUBSCRIBED") {
        // Voltou depois de cair: recarrega para pegar o que chegou enquanto estava fora
        if (jaConectou) setVersao((v) => v + 1);
        jaConectou = true;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn(`Avisos de pedido novo indisponíveis (${status}). Veja a seção REALTIME do supabase/schema.sql.`);
      }
    }

    ouvirPedidosNovos(aoChegar, aoMudarConexao).then((parar) => {
      if (ativo) pararDeOuvir = parar;
      else parar();
    });
    return () => {
      ativo = false;
      pararDeOuvir();
    };
  }, [mostrarToast]);

  // Na página de pedidos, com a aba visível, tudo já foi visto
  const naPaginaPedidos = pathname.startsWith(PAGINA_PEDIDOS);
  useEffect(() => {
    if (!naPaginaPedidos) return undefined;
    const marcarVistos = () => document.visibilityState === "visible" && setNaoVistos(0);
    marcarVistos();
    document.addEventListener("visibilitychange", marcarVistos);
    return () => document.removeEventListener("visibilitychange", marcarVistos);
  }, [naPaginaPedidos, naoVistos]);

  return { naoVistos, versao };
}
