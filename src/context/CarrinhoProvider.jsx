/* Estado global do carrinho: itens, ações e resumo calculado.
   Fica salvo no navegador e sincroniza entre abas.
   Precisa ficar dentro do <ProdutosProvider> (usa a lista de produtos nos cálculos;
   itens de produtos que saíram da loja são ignorados). */
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useProdutos } from "../hooks/useProdutos";
import { CHAVES, gravarLocal, lerLocal } from "../utils/armazenamento";
import { calcularResumo, QTD_MAXIMA, sanitizarCarrinho } from "../utils/carrinho";
import { CarrinhoContext } from "./contextos";
const carregarSalvo = () => sanitizarCarrinho(lerLocal(CHAVES.carrinho, {}));

function reducer(itens, acao) {
  switch (acao.tipo) {
    case "alterar": {
      const nova = (itens[acao.id] || 0) + acao.diferenca;
      const proximo = { ...itens };
      if (nova <= 0) delete proximo[acao.id];
      else proximo[acao.id] = Math.min(nova, QTD_MAXIMA);
      return proximo;
    }
    case "remover": {
      const proximo = { ...itens };
      delete proximo[acao.id];
      return proximo;
    }
    case "limpar":
      return {};
    case "substituir":
      return acao.itens;
    default:
      return itens;
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, dispatch] = useReducer(reducer, undefined, carregarSalvo);
  const { porId } = useProdutos();
  // Conta quantas vezes algo foi adicionado (faz o contador "pular")
  const [pulos, setPulos] = useState(0);

  useEffect(() => {
    gravarLocal(CHAVES.carrinho, itens);
  }, [itens]);

  // Se o carrinho mudar em outra aba, atualiza esta também
  useEffect(() => {
    const aoMudarOutraAba = (e) => {
      if (e.key === CHAVES.carrinho) dispatch({ tipo: "substituir", itens: carregarSalvo() });
    };
    window.addEventListener("storage", aoMudarOutraAba);
    return () => window.removeEventListener("storage", aoMudarOutraAba);
  }, []);

  const adicionar = useCallback((id, quantidade = 1) => {
    dispatch({ tipo: "alterar", id, diferenca: quantidade });
    setPulos((n) => n + 1);
  }, []);
  const alterar = useCallback((id, diferenca) => dispatch({ tipo: "alterar", id, diferenca }), []);
  const remover = useCallback((id) => dispatch({ tipo: "remover", id }), []);
  const limpar = useCallback(() => dispatch({ tipo: "limpar" }), []);

  const valor = useMemo(
    () => ({ itens, resumo: calcularResumo(itens, porId), pulos, adicionar, alterar, remover, limpar }),
    [itens, porId, pulos, adicionar, alterar, remover, limpar]
  );

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>;
}

