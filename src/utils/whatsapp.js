/* Mensagem do pedido e abertura do WhatsApp. */
import CONFIG from "../config/loja";
import { CHAVES, sessao } from "./armazenamento";
import { textoTotal } from "./carrinho";
import { formatarEndereco, moeda } from "./formatacao";
import { linkAcompanhar } from "./meusPedidos";
import { ehEntrega } from "./pedido";
import { nomeNoPedido } from "./produtos";

const DDI_BRASIL = "55";

/** Link de conversa no WhatsApp com um número (só dígitos, com DDI) e mensagem opcional. */
function linkConversa(numero, mensagem) {
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${String(numero).replace(/\D/g, "")}${texto}`;
}

/** Link do WhatsApp da loja com uma mensagem já escrita. */
export const linkWhatsApp = (mensagem) => linkConversa(CONFIG.whatsapp, mensagem);

/** "(11) 98888-7777" → link do WhatsApp do cliente (usado no painel). */
export const linkWhatsAppCliente = (telefone) => linkConversa(`${DDI_BRASIL}${telefone.replace(/\D/g, "")}`);

/**
 * Texto do pedido, no formato combinado com a loja.
 * resumo: resultado de calcularResumo(itens, produtosPorId, dados.tipo)
 * dados: campos do formulário (nome, telefone, tipo, endereço...)
 * codigo: código do pedido (opcional; aparece no painel admin para conferir)
 * token: link de acompanhamento do pedido (opcional)
 */
export function montarMensagem(resumo, dados, codigo, token) {
  const titulo = codigo ? `🧾 Pedido #${codigo}` : "🧾 Pedido";
  const linhas = [`Olá, ${CONFIG.nomeLoja}! 🐱🍫`, "Gostaria de fazer um pedido:", "", titulo, ""];

  resumo.itens.forEach(({ produto, qtd, subtotal }) => {
    linhas.push(`${qtd}x ${nomeNoPedido(produto)} — ${subtotal === null ? "sob consulta" : moeda(subtotal)}`);
  });

  linhas.push("");
  if (resumo.taxa) linhas.push(`🛵 Taxa de entrega: ${moeda(resumo.taxa)}`);
  const extra = resumo.sobConsulta && resumo.temValor ? " (+ itens sob consulta)" : "";
  linhas.push(`💰 Total: ${textoTotal(resumo)}${extra}`);

  linhas.push("", `👤 Nome: ${dados.nome}`, `📱 Telefone: ${dados.telefone}`);
  linhas.push(ehEntrega(dados.tipo) ? `🚚 Entrega: ${formatarEndereco(dados)}` : "🏠 Retirada no local");
  linhas.push(`💳 Pagamento: ${dados.pagamento}`);
  if (dados.obs) linhas.push(`📝 Observações: ${dados.obs}`);
  if (token) linhas.push("", `📍 Acompanhe seu pedido: ${linkAcompanhar(token)}`);

  return linhas.join("\n");
}

/**
 * Abre o WhatsApp em nova aba. Se o navegador bloquear (comum no celular),
 * abre na mesma aba e guarda o link para mostrar "Pedido enviado" na volta.
 */
export function abrirWhatsApp(url) {
  const janela = window.open(url, "_blank");
  if (janela) {
    janela.opener = null;
  } else {
    sessao.gravar(CHAVES.pedidoEnviado, url);
    window.location.href = url;
  }
}

/** Link do pedido enviado na mesma aba (se houver), para retomar a tela de sucesso. */
export const consumirPedidoEnviado = () => sessao.consumir(CHAVES.pedidoEnviado);
