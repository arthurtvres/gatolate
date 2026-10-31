import { useContext } from "react";
import { ToastContext } from "../context/contextos";

/** Devolve a função mostrar(mensagem) do aviso rápido. */
export function useToast() {
  const mostrar = useContext(ToastContext);
  if (!mostrar) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return mostrar;
}
