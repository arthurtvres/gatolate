/* Aviso rápido na parte de baixo da tela ("Adicionado ao carrinho ♥"). */
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastContext } from "./contextos";

const DURACAO = 2200;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ mensagem: "", visivel: false });
  const timer = useRef();

  /** mostrar(mensagem) · mostrar(mensagem, ms) para textos que pedem mais tempo de leitura */
  const mostrar = useCallback((mensagem, duracao = DURACAO) => {
    setToast({ mensagem, visivel: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, visivel: false })), duracao);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className={`toast${toast.visivel ? " visivel" : ""}`} role="status" aria-live="polite">
        {toast.mensagem}
      </div>
    </ToastContext.Provider>
  );
}

