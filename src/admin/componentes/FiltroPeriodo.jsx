import { PERIODOS } from "../utils/metricas";

/** Botões de período (Hoje, 7 dias, 30 dias...). Fica uma vez só, acima de tudo que ele filtra. */
export default function FiltroPeriodo({ valor, onMudar }) {
  return (
    <div className="admin-filtro" role="group" aria-label="Período">
      {PERIODOS.map((periodo) => (
        <button
          key={periodo.id}
          type="button"
          className="admin-filtro__opcao"
          aria-pressed={valor === periodo.id}
          onClick={() => onMudar(periodo.id)}
        >
          {periodo.rotulo}
        </button>
      ))}
    </div>
  );
}
