import { useState } from "react";
import { nomeStatus, valorPedido } from "../../services/pedidosApi";
import { dataCurta, moeda } from "../../utils/formatacao";
import { linkAcompanhar } from "../../utils/meusPedidos";
import AvancarStatus from "./AvancarStatus";

const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** "(11) 98888-7777" → link do WhatsApp do cliente */
const whatsDoCliente = (telefone) => `https://wa.me/55${telefone.replace(/\D/g, "")}`;

/** "1.234,50" ou "1234.5" → 1234.5 (null se vazio ou inválido) */
function lerValor(texto) {
  const limpo = texto.trim().replace(/[^\d,.-]/g, "");
  if (!limpo) return null;
  const numero = Number(limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo);
  return Number.isFinite(numero) && numero >= 0 ? numero : NaN;
}

/** Um pedido da lista, com detalhes, status e ajuste de valor. */
export default function ItemPedido({ pedido, onAtualizar, onCopiado }) {
  const [valorTexto, setValorTexto] = useState(
    pedido.total_final !== null ? String(pedido.total_final).replace(".", ",") : ""
  );
  const [salvando, setSalvando] = useState(false);
  const valor = valorPedido(pedido);
  const valorDigitado = lerValor(valorTexto);
  const valorInvalido = Number.isNaN(valorDigitado);
  const valorMudou = !valorInvalido && valorDigitado !== (pedido.total_final === null ? null : Number(pedido.total_final));

  async function salvar(campos) {
    setSalvando(true);
    await onAtualizar(pedido.id, campos);
    setSalvando(false);
  }

  const quando = [pedido.data_desejada && dataCurta(pedido.data_desejada), pedido.periodo].filter(Boolean).join(", ");

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
            {moeda(valor)}
            {pedido.tem_sob_consulta && pedido.total_final === null && <small> + sob consulta</small>}
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
            <div>
              <dt>Telefone</dt>
              <dd>
                <a href={whatsDoCliente(pedido.cliente_telefone)} target="_blank" rel="noopener">
                  {pedido.cliente_telefone} (WhatsApp)
                </a>
              </dd>
            </div>
            <div>
              <dt>{pedido.tipo === "entrega" ? "Entrega" : "Retirada"}</dt>
              <dd>{pedido.tipo === "entrega" ? pedido.endereco : "Cliente busca no local"}</dd>
            </div>
            {quando && (
              <div>
                <dt>Para</dt>
                <dd>{quando}</dd>
              </div>
            )}
            <div>
              <dt>Pagamento</dt>
              <dd>{pedido.pagamento}</dd>
            </div>
            {pedido.token && (
              <div>
                <dt>Acompanhamento</dt>
                <dd>
                  <button
                    className="admin-link"
                    type="button"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(linkAcompanhar(pedido.token))
                        .then(() => onCopiado("Link copiado. É só colar no WhatsApp do cliente ♥"))
                        .catch(() => onCopiado("Não deu para copiar o link"))
                    }
                  >
                    Copiar link para o cliente
                  </button>
                </dd>
              </div>
            )}
            {pedido.observacoes && (
              <div>
                <dt>Observações</dt>
                <dd>{pedido.observacoes}</dd>
              </div>
            )}
          </dl>

          <AvancarStatus pedido={pedido} salvando={salvando} onMudar={(status) => salvar({ status })} />

          <div className="admin-pedido__acoes">

            <form
              className="admin-pedido__valor-final"
              onSubmit={(e) => {
                e.preventDefault();
                if (valorMudou) salvar({ total_final: valorDigitado });
              }}
            >
              <label className="admin-campo admin-campo--linha">
                <span>Valor final (R$)</span>
                <input
                  inputMode="decimal"
                  placeholder={String(valor.toFixed(2)).replace(".", ",")}
                  value={valorTexto}
                  aria-invalid={valorInvalido || undefined}
                  onChange={(e) => setValorTexto(e.target.value)}
                />
              </label>
              <button className="admin-botao" type="submit" disabled={!valorMudou || salvando}>
                Salvar valor
              </button>
            </form>
            <p className="admin-dica">
              {valorInvalido
                ? "Digite um valor válido, ex.: 45,00"
                : "Use para itens sob consulta, descontos ou taxa de entrega combinada. Em branco = soma automática."}
            </p>
          </div>
        </div>
      </details>
    </li>
  );
}
