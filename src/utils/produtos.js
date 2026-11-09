/* Funções de produto (puras: recebem o produto, não buscam nada). */
import { normalizar } from "./formatacao";

/** true se o produto tem preço (false = "Sob consulta"). */
export const temPreco = (produto) => typeof produto.preco === "number";

/** Nome usado na mensagem do WhatsApp. */
export const nomeNoPedido = (produto) => produto.nomeNoPedido || produto.nome;

/** Caminho de um arquivo da pasta public/ (ou um link completo, como as fotos do Supabase). */
export const caminhoPublico = (arquivo) =>
  /^(https?:|data:|blob:)/.test(arquivo) ? arquivo : `${import.meta.env.BASE_URL}${arquivo}`;

/** "Brownie de Ninho!" → "brownie-de-ninho" (id de produto novo). */
export const gerarId = (nome) =>
  normalizar(nome)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
