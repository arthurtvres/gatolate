import { ArrowLeft, CircleX } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import LinhaDoTempo from "../components/pedido/LinhaDoTempo";
import Icone from "../components/ui/Icone";
import CONFIG from "../config/loja";
import { useAcompanhamento } from "../hooks/useAcompanhamento";
import { nomeStatusCliente, valorPedido } from "../services/pedidosApi";
import { moeda } from "../utils/formatacao";
import { caminhoPublico } from "../utils/produtos";
import { linkWhatsApp } from "../utils/whatsapp";

const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Frase embaixo do status, para o cliente saber o que acontece agora. */
function explicacao(status, tipo) {
  const entrega = tipo === "entrega";
  switch (status) {
    case "pendente":
      return "Recebemos seu pedido! Assim que a loja confirmar, você vê aqui.";
    case "confirmado":
      return "A loja confirmou seu pedido. Já já começa o preparo.";
    case "preparando":
      return "Seus brownies estão sendo preparados com carinho.";
    case "pronto":
      return entrega ? "Seu pedido está a caminho. Fique de olho!" : "Seu pedido está pronto. Pode vir buscar!";
    case "entregue":
      return "Pedido finalizado. Bom apetite! ♥";
    case "cancelado":
      return "Este pedido foi cancelado. Se tiver dúvidas, fale com a gente pelo WhatsApp.";
    default:
      return "";
  }
}

/** Página /pedido/:token — o cliente acompanha o status sem login, como no iFood. */
export default function AcompanharPedido() {
  const { token } = useParams();
  const { estado, pedido } = useAcompanhamento(token);

  // Vindo da loja (gaveta do carrinho), começa do topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = pedido ? `Pedido #${pedido.codigo} · ${CONFIG.nomeLoja}` : `Acompanhar pedido · ${CONFIG.nomeLoja}`;
  }, [pedido]);

  return (
    <div className="acompanhar">
      <header className="acompanhar__topo">
        <Link className="acompanhar__voltar" to="/">
          <ArrowLeft aria-hidden="true" />
          Voltar para a loja
        </Link>
        <img className="acompanhar__logo" src={caminhoPublico("logo.png")} alt={CONFIG.nomeLoja} width="64" height="64" />
      </header>

      <main className="acompanhar__conteudo">
        {estado === "carregando" && <p className="acompanhar__aviso">Buscando seu pedido...</p>}

        {(estado === "nao-encontrado" || estado === "erro") && (
          <div className="acompanhar__vazio">
            <Icone nome="gato" className="acompanhar__gato" />
            <p className="manuscrito">
              {estado === "erro" ? "Não conseguimos carregar agora..." : "Não encontramos esse pedido..."}
            </p>
            <p>
              {estado === "erro"
                ? "Confira sua internet e tente de novo em instantes."
                : "Confira se o link está completo ou fale com a gente pelo WhatsApp."}
            </p>
            <Link className="btn" to="/">
              Ver brownies
            </Link>
          </div>
        )}

        {pedido && <DetalhesPedido pedido={pedido} />}
      </main>
    </div>
  );
}

function DetalhesPedido({ pedido }) {
  const cancelado = pedido.status === "cancelado";
  const valor = valorPedido(pedido);
  const mensagem = `Olá, ${CONFIG.nomeLoja}! Queria falar sobre o pedido #${pedido.codigo}.`;

  return (
    <>
      <section className={`acompanhar__status${cancelado ? " acompanhar__status--cancelado" : ""}`} aria-live="polite">
        <p className="acompanhar__codigo">
          Pedido #{pedido.codigo}
          {pedido.primeiro_nome && <> · {pedido.primeiro_nome}</>}
        </p>
        <h1 className="manuscrito">
          {cancelado && <CircleX aria-hidden="true" />}
          {cancelado ? "Pedido cancelado" : nomeStatusCliente(pedido.status, pedido.tipo)}
        </h1>
        <p>{explicacao(pedido.status, pedido.tipo)}</p>
        <p className="acompanhar__atualizado">
          {!cancelado && pedido.status !== "entregue" && <span className="acompanhar__ao-vivo" aria-hidden="true" />}
          Atualizado às {hora.format(new Date(pedido.atualizado_em))}
        </p>
      </section>

      {!cancelado && <LinhaDoTempo pedido={pedido} />}

      <section className="acompanhar__itens" aria-labelledby="acompanhar-itens">
        <h2 id="acompanhar-itens">Seu pedido</h2>
        <ul>
          {pedido.itens.map((item, i) => (
            <li key={i}>
              <span>
                <strong>{item.quantidade}×</strong> {item.nome}
              </span>
              <span>{item.subtotal === null ? "Sob consulta" : moeda(Number(item.subtotal))}</span>
            </li>
          ))}
          {Number(pedido.taxa_entrega) > 0 && (
            <li className="acompanhar__taxa">
              <span>Entrega</span>
              <span>{moeda(Number(pedido.taxa_entrega))}</span>
            </li>
          )}
        </ul>
        <div className="linha-total">
          <span>Total</span>
          <strong>
            {moeda(valor)}
            {pedido.tem_sob_consulta && pedido.total_final === null && <small> + sob consulta</small>}
          </strong>
        </div>
        {pedido.pagamento && <p className="nota">Pagamento: {pedido.pagamento}</p>}
      </section>

      <a className="btn btn--cheio btn--whatsapp" href={linkWhatsApp(mensagem)} target="_blank" rel="noopener">
        <Icone nome="whatsapp" />
        Falar com a loja
      </a>
    </>
  );
}
