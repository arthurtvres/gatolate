import { listarPedidos } from "../../services/pedidosApi";
import { inicioDoPeriodo } from "../utils/metricas";
import { useVersaoPedidos } from "./useAvisosPedidos";
import { useConsulta } from "./useConsulta";

/** Pedidos do período escolhido; recarrega sozinho quando chega pedido novo. */
export function usePedidosDoPeriodo(periodo) {
  const versao = useVersaoPedidos();
  return useConsulta(() => listarPedidos(inicioDoPeriodo(periodo)), `pedidos-${periodo}#${versao}`);
}
