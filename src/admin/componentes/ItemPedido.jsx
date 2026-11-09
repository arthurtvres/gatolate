import { useState } from "react";
import { decimal, lerMoeda, moeda } from "../../utils/formatacao";
import { linkAcompanhar } from "../../utils/meusPedidos";
import { ehEntrega, faltaValorFinal, nomeStatus, valorPedido } from "../../utils/pedido";
import { linkWhatsAppCliente } from "../../utils/whatsapp";
import AvancarStatus from "./AvancarStatus";

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const totalFinal = (pedido) => (pedido.total_final === null ? null : Number(pedido.total_final));

/** Um pedido da lista, com detalhes, status e ajuste de valor. */
export default function ItemPedido({ pedido, onAtualizar, onAvisar }) {
  const [salvando, setSalvando] = useState(false);
  const entrega = ehEntrega(pedido.tipo);

  async function salvar(campos) {
    setSalvando(true);
    await onAtualizar(pedido.id, campos);
    setSalvando(false);
  }

  function copiarLinkAcompanhar() {
    navigator.clipboard
      .writeText(linkAcompanhar(pedido.token))
      .then(() => onAvisar("Link copiado. É só colar no WhatsApp do cliente ♥"))
      .catch(() => onAvisar("Não deu para copiar o link"));
  }

  return (
    <li className={`admin-pedido admin-pedido--${pedido.status}`}>
      <details>
        <summary className="admin-pedido__resumo">
          <span className="admin-pedido__codigo">#{pedido.codigo}</span>
          <span className="admin-pedido__cliente">
            <strong>{pedido.cliente_nome}</strong>
            <small>{dataHora.format(new Date(pedido.criado_em))}</small>
          </span>
          <span className="admin-pedido__valor">
            {moeda(valorPedido(pedido))}
            {faltaValorFinal(pedido) && <small> + sob consulta</small>}
          </span>
          <span className={`admin-status admin-status--${pedido.status}`}>{nomeStatus(pedido.status, pedido.tipo)}</span>
        </summary>

        <div className="admin-pedido__detalhes">
          <ul className="admin-pedido__itens">
            {pedido.itens.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantidade}× {item.nome}
                </span>
                <span>{item.subtotal === null ? "sob consulta" : moeda(Number(item.subtotal))}</span>
              </li>
            ))}
            {Number(pedido.taxa_entrega) > 0 && (
              <li>
                <span>Entrega</span>
                <span>{moeda(Number(pedido.taxa_entrega))}</span>
              </li>
            )}
          </ul>

          <dl className="admin-pedido__dados">
            <Dado rotulo="Telefone">
              <a href={linkWhatsAppCliente(pedido.cliente_telefone)} target="_blank" rel="noopener">
                {pedido.cliente_telefone} (WhatsApp)
              </a>
            </Dado>
            <Dado rotulo={entrega ? "Entrega" : "Retirada"}>{entrega ? pedido.endereco : "Cliente busca no local"}</Dado>
            <Dado rotulo="Pagamento">{pedido.pagamento}</Dado>
            {pedido.token && (
              <Dado rotulo="Acompanhamento">
                <button className="admin-link" type="button" onClick={copiarLinkAcompanhar}>
                  Copiar link para o cliente
                </button>
              </Dado>
            )}
            {pedido.observacoes && <Dado rotulo="Observações">{pedido.observacoes}</Dado>}
          </dl>

          <AvancarStatus pedido={pedido} salvando={salvando} onMudar={(status) => salvar({ status })} />

          <ValorFinal pedido={pedido} salvando={salvando} onSalvar={(valor) => salvar({ total_final: valor })} />
        </div>
      </details>
    </li>
  );
}

function Dado({ rotulo, children }) {
  return (
    <div>
      <dt>{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Campo para a admin ajustar o valor (itens sob consulta, descontos, entrega combinada). */
function ValorFinal({ pedido, salvando, onSalvar }) {
  const atual = totalFinal(pedido);
  const [texto, setTexto] = useState(atual === null ? "" : decimal(atual));
  const digitado = lerMoeda(texto);
  const invalido = Number.isNaN(digitado);
  const mudou = !invalido && digitado !== atual;

  function aoEnviar(e) {
    e.preventDefault();
    if (mudou) onSalvar(digitado);
  }

  return (
    <div className="admin-pedido__acoes">
      <form className="admin-pedido__valor-final" onSubmit={aoEnviar}>
        <label className="admin-campo admin-campo--linha">
          <span>Valor final (R$)</span>
          <input
            inputMode="decimal"
            placeholder={decimal(valorPedido(pedido))}
            value={texto}
            aria-invalid={invalido || undefined}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <button className="admin-botao" type="submit" disabled={!mudou || salvando}>
          Salvar valor
        </button>
      </form>
      <p className="admin-dica">
        {invalido
          ? "Digite um valor válido, ex.: 45,00"
          : "Use para itens sob consulta, descontos ou taxa de entrega combinada. Em branco = soma automática."}
      </p>
    </div>
  );
}
