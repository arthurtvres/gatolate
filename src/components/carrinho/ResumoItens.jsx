import { Pencil } from "lucide-react";
import { moeda } from "../../utils/formatacao";
import { nomeNoPedido } from "../../utils/produtos";
import FotoProduto from "../produtos/FotoProduto";

/** Itens do pedido no topo do checkout, para a cliente conferir antes de enviar. */
export default function ResumoItens({ resumo, onEditar }) {
  const { itens, quantidade, subtotal, taxa, temValor } = resumo;

  return (
    <section className="resumo-itens" aria-labelledby="resumo-itens-titulo">
      <div className="resumo-itens__topo">
        <h3 id="resumo-itens-titulo">
          Seu pedido <span>({quantidade} {quantidade === 1 ? "item" : "itens"})</span>
        </h3>
        <button type="button" className="cartao-salvo__alterar" onClick={onEditar}>
          <Pencil aria-hidden="true" />
          Editar itens
        </button>
      </div>

      <ul className="resumo-itens__lista">
        {itens.map(({ produto, qtd, subtotal: valor }) => (
          <li key={produto.id}>
            <span className="resumo-itens__foto">
              <FotoProduto produto={produto} mini />
            </span>
            <span className="resumo-itens__nome">
              <strong>{qtd}×</strong> {nomeNoPedido(produto)}
              {produto.unidade && <small>{produto.unidade}</small>}
            </span>
            <span className="resumo-itens__valor">{valor === null ? "Sob consulta" : moeda(valor)}</span>
          </li>
        ))}
      </ul>

      {taxa > 0 && temValor && (
        <dl className="resumo-itens__contas">
          <div>
            <dt>Subtotal</dt>
            <dd>{moeda(subtotal)}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{moeda(taxa)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
