import { ArrowRight, RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";
import { ETAPAS, nomeStatus, proximoStatus, statusAnterior } from "../../services/pedidosApi";

/** Texto do botão principal: a ação que leva para a próxima etapa. */
function acaoPara(proximo, tipo) {
  const entrega = tipo === "entrega";
  if (proximo === "confirmado") return "Confirmar pedido";
  if (proximo === "preparando") return "Iniciar preparo";
  if (proximo === "pronto") return entrega ? "Saiu para entrega" : "Pronto para retirada";
  return entrega ? "Marcar como entregue" : "Marcar como retirado";
}

/**
 * Etapas do pedido no painel: um botão grande avança para a próxima
 * (como no iFood). Voltar uma etapa e cancelar ficam menores, para não clicar sem querer.
 */
export default function AvancarStatus({ pedido, salvando, onMudar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const { status, tipo } = pedido;
  const cancelado = status === "cancelado";
  const atual = ETAPAS.indexOf(status);
  const proximo = proximoStatus(status);
  const anterior = statusAnterior(status);

  return (
    <div className="admin-etapas">
      {!cancelado && (
        <ol className="admin-etapas__trilha" aria-label="Etapas do pedido">
          {ETAPAS.map((etapa, i) => (
            <li
              key={etapa}
              className={i < atual ? "feita" : i === atual ? "atual" : undefined}
              aria-current={i === atual ? "step" : undefined}
            >
              {nomeStatus(etapa, tipo)}
            </li>
          ))}
        </ol>
      )}

      <div className="admin-etapas__botoes">
        {proximo && (
          <button
            className="admin-botao admin-botao--cheio"
            type="button"
            disabled={salvando}
            onClick={() => onMudar(proximo)}
          >
            {acaoPara(proximo, tipo)}
            <ArrowRight aria-hidden="true" />
          </button>
        )}
        {status === "entregue" && <span className="admin-etapas__fim">Pedido finalizado ♥</span>}

        {cancelado && (
          <button className="admin-botao" type="button" disabled={salvando} onClick={() => onMudar("pendente")}>
            <RotateCcw aria-hidden="true" />
            Reabrir pedido
          </button>
        )}

        {anterior && (
          <button
            className="admin-botao admin-botao--claro"
            type="button"
            disabled={salvando}
            onClick={() => onMudar(anterior)}
            title={`Voltar para "${nomeStatus(anterior, tipo)}"`}
          >
            <Undo2 aria-hidden="true" />
            Voltar etapa
          </button>
        )}

        {!cancelado &&
          status !== "entregue" &&
          (confirmandoCancelar ? (
            <span className="admin-etapas__confirmar" role="group" aria-label="Confirmar cancelamento">
              Cancelar este pedido?
              <button
                className="admin-botao admin-botao--perigo"
                type="button"
                disabled={salvando}
                onClick={() => {
                  setConfirmandoCancelar(false);
                  onMudar("cancelado");
                }}
              >
                Sim, cancelar
              </button>
              <button className="admin-botao admin-botao--claro" type="button" onClick={() => setConfirmandoCancelar(false)}>
                Não
              </button>
            </span>
          ) : (
            <button className="admin-etapas__cancelar" type="button" onClick={() => setConfirmandoCancelar(true)}>
              Cancelar pedido
            </button>
          ))}
      </div>
    </div>
  );
}
