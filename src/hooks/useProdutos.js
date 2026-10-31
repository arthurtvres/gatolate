import { useContext } from "react";
import { ProdutosContext } from "../context/contextos";

/** Produtos da loja: { produtos, porId, carregando, erro, recarregar }. */
export function useProdutos() {
  const contexto = useContext(ProdutosContext);
  if (!contexto) throw new Error("useProdutos precisa estar dentro de <ProdutosProvider>");
  return contexto;
}
