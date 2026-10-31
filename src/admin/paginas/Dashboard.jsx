import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarPedidos } from "../../services/pedidosApi";
import { moeda, plural } from "../../utils/formatacao";
import FiltroPeriodo from "../componentes/FiltroPeriodo";
import GraficoColunas from "../componentes/GraficoColunas";
import RankingBarras from "../componentes/RankingBarras";
import StatTile from "../componentes/StatTile";
import { useConsulta } from "../hooks/useConsulta";
import { calcularMetricas, inicioDoPeriodo } from "../utils/metricas";

const moedaCurta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1
});
/** Eixo: "R$ 0", "R$ 50", "R$ 1,5 mil" */
const formatarEixo = (valor) =>
  valor >= 1000 ? moedaCurta.format(valor) : `R$ ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("30d");
  const { dados: pedidos, carregando, erro, recarregar } = useConsulta(
    () => listarPedidos(inicioDoPeriodo(periodo)),
    `dashboard-${periodo}`
  );
  const m = useMemo(() => (pedidos ? calcularMetricas(pedidos, periodo) : null), [pedidos, periodo]);

  return (
    <div className="admin-pagina">
      <div className="admin-pagina__cabecalho">
        <h1 className="manuscrito">Dashboard</h1>
        <FiltroPeriodo valor={periodo} onMudar={setPeriodo} />
      </div>

      {erro && (
        <p className="admin-erro" role="alert">
          {erro}{" "}
          <button className="admin-botao" type="button" onClick={recarregar}>
            Tentar de novo
          </button>
        </p>
      )}

      {!m ? (
        <p className="admin-carregando">Carregando números...</p>
      ) : (
        // Ao trocar o período, mantém os números antigos esmaecidos até chegarem os novos
        <div className={`admin-dashboard${carregando ? " admin-recarregando" : ""}`} aria-busy={carregando}>
          <section className="admin-stats" aria-label="Resumo do período">
            <StatTile
              destaque
              rotulo="Faturamento"
              valor={moeda(m.faturamento)}
              detalhe="Pedidos confirmados e entregues"
            />
            <StatTile rotulo="Vendas" valor={m.vendas} detalhe={`de ${plural(m.totalPedidos, "pedido", "pedidos")}`} />
            <StatTile rotulo="Ticket médio" valor={moeda(m.ticketMedio)} detalhe="Por venda" />
            <StatTile
              rotulo="Pendentes"
              valor={m.pendentes}
              detalhe={
                m.pendentes ? <Link to="/admin/pedidos">Confirmar pedidos →</Link> : "Nada aguardando confirmação"
              }
            />
          </section>

          {m.semValorDefinido > 0 && (
            <p className="admin-alerta">
              {plural(m.semValorDefinido, "venda tem", "vendas têm")} item sob consulta sem valor definido — o
              faturamento pode estar abaixo do real. <Link to="/admin/pedidos">Definir valores</Link>
            </p>
          )}

          <div className="admin-graficos">
            <GraficoColunas
              titulo={`Faturamento por ${m.serie.agrupamento}`}
              descricao="Soma dos pedidos confirmados e entregues"
              rotuloColuna={m.serie.agrupamento === "mês" ? "Mês" : "Dia"}
              dados={m.serie.pontos.map((p) => ({
                ...p,
                detalhe: plural(p.vendas, "venda", "vendas")
              }))}
              formatarValor={moeda}
              formatarEixo={formatarEixo}
            />
            <RankingBarras
              titulo="Mais vendidos"
              descricao="Unidades vendidas no período"
              itens={m.ranking.map((r) => ({ ...r, valor: r.quantidade }))}
              formatarValor={(v) => plural(v, "un.", "un.")}
              formatarDetalhe={(item) => (item.receita ? moeda(item.receita) : "sob consulta")}
              vazio="Nenhuma venda confirmada neste período ainda."
            />
          </div>
        </div>
      )}
    </div>
  );
}
