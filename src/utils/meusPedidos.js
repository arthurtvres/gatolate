/* Pedidos feitos neste navegador, para o cliente acompanhar sem login.
   Guarda só o código e o token do link de acompanhamento (nada pessoal). */
import { CHAVES, gravarLocal, lerLocal } from "./armazenamento";

const MAXIMO = 5;

/** Lista salva, do mais novo para o mais antigo: [{ codigo, token, criadoEm }] */
export function meusPedidos() {
  const lista = lerLocal(CHAVES.meusPedidos, []);
  return Array.isArray(lista) ? lista.filter((p) => p && typeof p.token === "string") : [];
}

export function salvarMeuPedido({ codigo, token }) {
  const outros = meusPedidos().filter((p) => p.token !== token);
  gravarLocal(CHAVES.meusPedidos, [{ codigo, token, criadoEm: Date.now() }, ...outros].slice(0, MAXIMO));
}

/** Pedido mais recente, se foi feito há menos de `idadeMaxima` ms (ou null). */
export function ultimoPedido(idadeMaxima = Infinity) {
  const pedido = meusPedidos()[0];
  return pedido && Date.now() - pedido.criadoEm < idadeMaxima ? pedido : null;
}

/** Tira da lista (ex.: link que não existe mais no banco). */
export function esquecerPedido(token) {
  gravarLocal(
    CHAVES.meusPedidos,
    meusPedidos().filter((p) => p.token !== token)
  );
}

/** Caminho da página de acompanhamento. */
export const caminhoAcompanhar = (token) => `/pedido/${token}`;

/** Link completo (vai na mensagem do WhatsApp, para abrir em qualquer aparelho). */
export const linkAcompanhar = (token) => `${window.location.origin}${caminhoAcompanhar(token)}`;
