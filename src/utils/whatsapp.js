/* Mensagem do pedido e abertura do WhatsApp. */
import CONFIG from "../config/loja";
import { CHAVES, sessao } from "./armazenamento";
import { textoTotal } from "./carrinho";
import { dataCurta, moeda } from "./formatacao";
import { nomeNoPedido } from "./produtos";

/** Link do WhatsApp da loja com uma mensagem já escrita. */
export function linkWhatsApp(mensagem) {
  const numero = String(CONFIG.whatsapp).replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** "Rua X, 123 – Bairro Y (apto 4)" */
export function formatarEndereco(dados) {
  const complemento = dados.complemento ? ` (${dados.complemento})` : "";
  return `${dados.rua}, ${dados.numero} – ${dados.bairro}${complemento}`;
}

/**
 * Texto do pedido, no formato combinado com a loja.
 * resumo: resultado de calcularResumo(itens, produtosPorId, dados.tipo)
 * dados: campos do formulário (nome, telefone, tipo, endereço, data...)
 * codigo: código do pedido (opcional; aparece no painel admin para conferir)
 */
export function montarMensagem(resumo, dados, codigo) {
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
  if (dados.tipo === "entrega") {
    linhas.push(`🚚 Entrega: ${formatarEndereco(dados)}`);
  } else {
    linhas.push("🏠 Retirada no local");
  }

  const quando = [dados.data && dataCurta(dados.data), dados.periodo].filter(Boolean).join(", ");
  if (quando) linhas.push(`📅 Para: ${quando}`);
  linhas.push(`💳 Pagamento: ${dados.pagamento}`);
  if (dados.obs) linhas.push(`📝 Observações: ${dados.obs}`);

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
