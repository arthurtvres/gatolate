import { useCarrinho } from "../../hooks/useCarrinho";
import { textoTotal } from "../../utils/carrinho";
import { plural } from "../../utils/formatacao";
import Contador from "../ui/Contador";
import Icone from "../ui/Icone";

/** Botão fixo embaixo da tela (só no celular, quando há itens). O CSS esconde no computador. */
export default function CarrinhoFlutuante({ visivel, onAbrir }) {
  const { resumo } = useCarrinho();
  if (!visivel || resumo.quantidade === 0) return null;

  return (
    <button className="carrinho-flutuante" type="button" aria-controls="carrinho" onClick={onAbrir}>
      <span className="carrinho-flutuante__icone">
        <Icone nome="carrinho" />
        <Contador />
      </span>
      <span className="carrinho-flutuante__texto">{plural(resumo.quantidade, "item", "itens")} no carrinho</span>
      <strong>{textoTotal(resumo)}</strong>
    </button>
  );
}
