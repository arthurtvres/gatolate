import Icone from "../ui/Icone";

/** Tela 3 da gaveta: depois de abrir o WhatsApp. */
export default function PedidoEnviado({ linkPedido, onLimpar, onFechar }) {
  return (
    <>
      <Icone nome="gato" className="enviado__gato" />
      <p className="manuscrito enviado__titulo">
        Pedido enviado! Finalize pelo WhatsApp <span aria-hidden="true">♥</span>
      </p>
      <p>
        Abrimos o WhatsApp com seu pedido prontinho. É só apertar <strong>enviar</strong> por lá — a gente responde
        rapidinho para combinar o pagamento.
      </p>
      <p className="nota">
        O WhatsApp não abriu?{" "}
        <a href={linkPedido} target="_blank" rel="noopener">
          Clique aqui
        </a>
        .
      </p>
      <button className="btn btn--cheio" type="button" onClick={onLimpar}>
        Limpar carrinho
      </button>
      <button className="btn-link" type="button" onClick={onFechar}>
        Manter carrinho e fechar
      </button>
    </>
  );
}
