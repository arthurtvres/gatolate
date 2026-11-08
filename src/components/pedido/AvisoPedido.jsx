import { ChevronRight, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAcompanhamento } from "../../hooks/useAcompanhamento";
import { nomeStatusCliente, statusFinal } from "../../services/pedidosApi";
import { caminhoAcompanhar, esquecerPedido, ultimoPedido } from "../../utils/meusPedidos";

const DOIS_DIAS = 2 * 24 * 60 * 60 * 1000;

/** Faixa na loja com o pedido em andamento: "Pedido #0012 · Em preparo — Acompanhar". */
export default function AvisoPedido() {
  const [salvo] = useState(() => ultimoPedido(DOIS_DIAS)); // ignora pedidos muito antigos
  const { estado, pedido } = useAcompanhamento(salvo?.token);

  // Link que não existe mais no banco: para de mostrar
  useEffect(() => {
    if (salvo && estado === "nao-encontrado") esquecerPedido(salvo.token);
  }, [salvo, estado]);

  if (!salvo || !pedido || statusFinal(pedido.status)) return null;

  return (
    <div className="aviso-pedido container">
      <Link className="aviso-pedido__link" to={caminhoAcompanhar(salvo.token)}>
        <span className="aviso-pedido__icone">
          <Receipt aria-hidden="true" />
        </span>
        <span className="aviso-pedido__texto">
          <small>Pedido #{pedido.codigo}</small>
          <strong>{nomeStatusCliente(pedido.status, pedido.tipo)}</strong>
        </span>
        <span className="aviso-pedido__acao">
          Acompanhar
          <ChevronRight aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
