import { useMemo, useState } from "react";
import { useToast } from "../../hooks/useToast";
import { atualizarPedido } from "../../services/pedidosApi";
import { normalizar, plural } from "../../utils/formatacao";
import { nomeStatus, STATUS } from "../../utils/pedido";
import ErroCarregamento from "../componentes/ErroCarregamento";
import FiltroPeriodo from "../componentes/FiltroPeriodo";
import ItemPedido from "../componentes/ItemPedido";
import { usePedidosDoPeriodo } from "../hooks/usePedidosDoPeriodo";

export default function Pedidos() {
  const [periodo, setPeriodo] = useState("30d");
  const [status, setStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const mostrarToast = useToast();
  const { dados, carregando, erro, recarregar, alterarDados } = usePedidosDoPeriodo(periodo);

  const pedidos = useMemo(() => {
    const termo = normalizar(busca);
    return (dados || []).filter(
      (p) =>
        (status === "todos" || p.status === status) &&
        (!termo || normalizar(`${p.codigo} ${p.cliente_nome} ${p.cliente_telefone}`).includes(termo))
    );
  }, [dados, status, busca]);

  const contagem = (s) => (dados || []).filter((p) => s === "todos" || p.status === s).length;

  async function aoAtualizar(id, campos) {
    try {
      const atualizado = await atualizarPedido(id, campos);
      alterarDados((lista) => lista.map((p) => (p.id === id ? atualizado : p)));
      mostrarToast(
        campos.status ? `Pedido #${atualizado.codigo}: ${nomeStatus(campos.status, atualizado.tipo).toLowerCase()}` : "Valor salvo ♥"
      );
    } catch (falha) {
      mostrarToast(falha.message);
    }
  }

  return (
    <div className="admin-pagina">
      <div className="admin-pagina__cabecalho">
        <h1 className="manuscrito">Pedidos</h1>
        <FiltroPeriodo valor={periodo} onMudar={setPeriodo} />
      </div>

      <div className="admin-barra-filtros">
        <div className="admin-abas" role="group" aria-label="Filtrar por status">
          {["todos", ...Object.keys(STATUS)].map((s) => (
            <button
              key={s}
              type="button"
              className="admin-abas__opcao"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {s === "todos" ? "Todos" : STATUS[s]} <span className="admin-abas__qtd">{contagem(s)}</span>
            </button>
          ))}
        </div>
        <label className="admin-busca">
          <span className="sr-only">Buscar pedido</span>
          <input
            type="search"
            placeholder="Buscar por código, nome ou telefone"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
      </div>

      <ErroCarregamento erro={erro} onTentarDeNovo={recarregar} />

      {!dados ? (
        <p className="admin-carregando">Carregando pedidos...</p>
      ) : (
        <div className={carregando ? "admin-recarregando" : undefined} aria-busy={carregando}>
          <p className="admin-contagem">{plural(pedidos.length, "pedido", "pedidos")}</p>
          {pedidos.length === 0 ? (
            <p className="admin-vazio">Nenhum pedido por aqui. 🐾</p>
          ) : (
            <ul className="admin-pedidos">
              {pedidos.map((pedido) => (
                <ItemPedido key={pedido.id} pedido={pedido} onAtualizar={aoAtualizar} onAvisar={mostrarToast} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
