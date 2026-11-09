import { Bike, ChefHat, CircleCheck, ClipboardList, Heart, Store } from "lucide-react";
import { ETAPAS, nomeStatusCliente } from "../../utils/pedido";

const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function iconeEtapa(etapa, tipo) {
  if (etapa === "pendente") return ClipboardList;
  if (etapa === "confirmado") return CircleCheck;
  if (etapa === "preparando") return ChefHat;
  if (etapa === "pronto") return tipo === "entrega" ? Bike : Store;
  return Heart;
}

/** Etapas do pedido: feitas (com horário), a atual (destacada) e as próximas (apagadas). */
export default function LinhaDoTempo({ pedido }) {
  const atual = ETAPAS.indexOf(pedido.status);
  const horarios = pedido.status_em || {};

  return (
    <ol className="linha-tempo">
      {ETAPAS.map((etapa, i) => {
        const estado = i < atual ? "feita" : i === atual ? "atual" : "proxima";
        const IconeEtapa = iconeEtapa(etapa, pedido.tipo);
        const quando = i <= atual && horarios[etapa] ? hora.format(new Date(horarios[etapa])) : null;
        return (
          <li key={etapa} className={`linha-tempo__etapa linha-tempo__etapa--${estado}`} aria-current={estado === "atual" ? "step" : undefined}>
            <span className="linha-tempo__icone">
              <IconeEtapa aria-hidden="true" />
            </span>
            <span className="linha-tempo__texto">
              {nomeStatusCliente(etapa, pedido.tipo)}
              {quando && <small>{quando}</small>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
