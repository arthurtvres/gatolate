/* Contextos globais. Os Providers ficam em CarrinhoProvider.jsx e
   ToastProvider.jsx; para usar, importe os hooks de src/hooks/. */
import { createContext } from "react";

export const CarrinhoContext = createContext(null);
export const ToastContext = createContext(null);
export const ProdutosContext = createContext(null);
export const ConfigLojaContext = createContext(null);
