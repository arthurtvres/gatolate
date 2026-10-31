import { useCarrinho } from "../../hooks/useCarrinho";
import { moeda } from "../../utils/formatacao";
import { temPreco } from "../../utils/produtos";
import FotoProduto from "../produtos/FotoProduto";
import Icone from "../ui/Icone";

export default function ItemCarrinho({ item, onRemovido }) {
  const { alterar, remover } = useCarrinho();
  const { produto, qtd, subtotal } = item;

  function diminuir() {
    if (qtd === 1) onRemovido();
    alterar(produto.id, -1);
  }

  function removerItem() {
    onRemovido();
    remover(produto.id);
  }

  return (
    <li className="item">
      <div className="item__foto">
        <FotoProduto produto={produto} mini />
      </div>
      <p className="item__nome">
        {produto.nome}
        <span className="item__unit">{temPreco(produto) ? `${moeda(produto.preco)} cada` : "Sob consulta"}</span>
      </p>
      <p className="item__subtotal">{subtotal === null ? "—" : moeda(subtotal)}</p>

      <div className="item__controles">
        <div className="quantidade" role="group" aria-label={`Quantidade de ${produto.nome}`}>
          <button type="button" aria-label={`Diminuir quantidade de ${produto.nome}`} onClick={diminuir}>
            <Icone nome="menos" />
          </button>
          <output>{qtd}</output>
          <button
            type="button"
            aria-label={`Aumentar quantidade de ${produto.nome}`}
            onClick={() => alterar(produto.id, 1)}
          >
            <Icone nome="mais" />
          </button>
        </div>
        <button type="button" className="remover" onClick={removerItem}>
          <Icone nome="lixeira" /> Remover<span className="sr-only"> {produto.nome}</span>
        </button>
      </div>
    </li>
  );
}
