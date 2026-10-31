/* Cálculos do dashboard (funções puras: recebem pedidos, devolvem números). */
import { STATUS_VENDA, valorPedido } from "../../services/pedidosApi";

export const PERIODOS = [
  { id: "hoje", rotulo: "Hoje", dias: 1 },
  { id: "7d", rotulo: "7 dias", dias: 7 },
  { id: "30d", rotulo: "30 dias", dias: 30 },
  { id: "90d", rotulo: "90 dias", dias: 90 },
  { id: "tudo", rotulo: "Tudo", dias: null }
];

const UM_DIA = 24 * 60 * 60 * 1000;

/** Meia-noite (horário local) do primeiro dia do período. null = desde sempre. */
export function inicioDoPeriodo(idPeriodo, agora = new Date()) {
  const periodo = PERIODOS.find((p) => p.id === idPeriodo);
  if (!periodo?.dias) return null;
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - (periodo.dias - 1));
  return inicio;
}

const ehVenda = (pedido) => STATUS_VENDA.includes(pedido.status);

/** "2026-10-31" no horário local */
const chaveDia = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
const chaveMes = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

const fmtDia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });

/**
 * Faturamento ao longo do tempo, com todos os dias (ou meses) do período,
 * inclusive os sem venda (valor 0), para o gráfico não "pular" datas.
 * Períodos maiores que 90 dias são agrupados por mês.
 */
function montarSerie(vendas, inicio, agora) {
  const comeco = inicio || (vendas.length ? new Date(Math.min(...vendas.map((p) => new Date(p.criado_em)))) : agora);
  const porMes = (agora - comeco) / UM_DIA > 92;
  const chave = porMes ? chaveMes : chaveDia;

  const baldes = new Map();
  const cursor = new Date(comeco);
  cursor.setHours(0, 0, 0, 0);
  if (porMes) cursor.setDate(1);
  while (cursor <= agora) {
    baldes.set(chave(cursor), {
      chave: chave(cursor),
      rotulo: (porMes ? fmtMes : fmtDia).format(cursor),
      valor: 0,
      vendas: 0
    });
    if (porMes) cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }

  vendas.forEach((pedido) => {
    const balde = baldes.get(chave(new Date(pedido.criado_em)));
    if (balde) {
      balde.valor += valorPedido(pedido);
      balde.vendas += 1;
    }
  });
  return { agrupamento: porMes ? "mês" : "dia", pontos: [...baldes.values()] };
}

/** Produtos mais vendidos (por quantidade) nas vendas do período. */
function montarRanking(vendas, limite = 5) {
  const porProduto = new Map();
  vendas.forEach((pedido) =>
    (pedido.itens || []).forEach((item) => {
      const id = item.produto_id || item.nome;
      const atual = porProduto.get(id) || { id, nome: item.nome, quantidade: 0, receita: 0 };
      atual.quantidade += item.quantidade;
      atual.receita += Number(item.subtotal || 0);
      porProduto.set(id, atual);
    })
  );
  return [...porProduto.values()].sort((a, b) => b.quantidade - a.quantidade || b.receita - a.receita).slice(0, limite);
}

/**
 * Tudo que o dashboard mostra. Filtra os pedidos pelo período aqui também:
 * ao trocar de período, os números batem na hora, mesmo antes da busca nova chegar.
 */
export function calcularMetricas(todosPedidos, idPeriodo, agora = new Date()) {
  const inicio = inicioDoPeriodo(idPeriodo, agora);
  const pedidos = inicio ? todosPedidos.filter((p) => new Date(p.criado_em) >= inicio) : todosPedidos;
  const vendas = pedidos.filter(ehVenda);
  const faturamento = vendas.reduce((soma, p) => soma + valorPedido(p), 0);
  const contagem = (status) => pedidos.filter((p) => p.status === status).length;

  return {
    faturamento,
    vendas: vendas.length,
    ticketMedio: vendas.length ? faturamento / vendas.length : 0,
    pendentes: contagem("pendente"),
    cancelados: contagem("cancelado"),
    totalPedidos: pedidos.length,
    // Pedidos confirmados/entregues que ainda têm item sem valor definido
    semValorDefinido: vendas.filter((p) => p.tem_sob_consulta && p.total_final === null).length,
    serie: montarSerie(vendas, inicio, agora),
    ranking: montarRanking(vendas)
  };
}
