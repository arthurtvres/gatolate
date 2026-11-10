import { useContext } from "react";
import { ConfigLojaContext } from "../context/contextos";

/** Configurações da loja: { textos, beneficios, pagamentos, aviso, pedidosPausados, bairros }. */
export function useConfigLoja() {
  const contexto = useContext(ConfigLojaContext);
  if (!contexto) throw new Error("useConfigLoja precisa estar dentro de <ConfigLojaProvider>");
  return contexto;
}
