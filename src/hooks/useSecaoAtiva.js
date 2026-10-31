import { useEffect, useState } from "react";

/**
 * Diz qual seção está na tela agora (para destacar o item do menu).
 * `ids` deve ser um array fixo (declarado fora do componente).
 */
export function useSecaoAtiva(ids) {
  const [ativa, setAtiva] = useState(ids[0]);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) setAtiva(entrada.target.id);
        });
      },
      // Considera "ativa" a seção que passa pela faixa entre 20% e 25% da altura da tela
      { rootMargin: "-20% 0px -75% 0px" }
    );
    ids.forEach((id) => {
      const secao = document.getElementById(id);
      if (secao) observador.observe(secao);
    });
    return () => observador.disconnect();
  }, [ids]);

  return ativa;
}
