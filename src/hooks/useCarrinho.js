import { useContext } from "react";
import { CarrinhoContext } from "../context/contextos";

/** Itens, resumo e ações do carrinho (adicionar, alterar, remover, limpar). */
export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);
  if (!contexto) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>");
  return contexto;
}
