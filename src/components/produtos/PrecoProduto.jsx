import { moeda } from "../../utils/formatacao";
import { temPreco } from "../../utils/produtos";

/** "R$ 8,00 unidade" ou "Sob consulta" (usado no card e no modal). */
export default function PrecoProduto({ produto }) {
  if (!temPreco(produto)) return "Sob consulta";
  return (
    <>
      {moeda(produto.preco)}
      {produto.unidade && <small>{produto.unidade}</small>}
    </>
  );
}
