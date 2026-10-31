import { useEffect, useRef } from "react";

const SELETOR_FOCAVEIS = "a[href], button, input, select, textarea";

/**
 * Para janelas sobrepostas (gaveta do carrinho):
 * - Tab e Shift+Tab ficam presos dentro de `ref`;
 * - Esc chama `aoFechar`;
 * - ao fechar, o foco volta para onde estava antes de abrir.
 */
export function usePrenderFoco(ref, ativo, aoFechar) {
  const aoFecharRef = useRef(aoFechar);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  });

  useEffect(() => {
    if (!ativo) return undefined;
    const elemento = ref.current;
    const focoAnterior = document.activeElement;

    function aoTeclar(e) {
      if (e.key === "Escape") {
        aoFecharRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focaveis = Array.from(elemento.querySelectorAll(SELETOR_FOCAVEIS)).filter(
        (el) => !el.disabled && el.offsetParent !== null
      );
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    elemento.addEventListener("keydown", aoTeclar);
    return () => {
      elemento.removeEventListener("keydown", aoTeclar);
      if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
    };
  }, [ativo, ref]);
}
