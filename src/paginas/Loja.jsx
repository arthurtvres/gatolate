import { useCallback, useState } from "react";
import CarrinhoFlutuante from "../components/carrinho/CarrinhoFlutuante";
import GavetaCarrinho from "../components/carrinho/GavetaCarrinho";
import Cabecalho from "../components/layout/Cabecalho";
import Rodape from "../components/layout/Rodape";
import SecaoProdutos from "../components/produtos/SecaoProdutos";
import SecaoContato from "../components/secoes/SecaoContato";
import SecaoSobre from "../components/secoes/SecaoSobre";
import Divisor from "../components/ui/Divisor";
import { consumirPedidoEnviado } from "../utils/whatsapp";

/* Quem enviou o pedido e voltou do WhatsApp (envio na mesma aba, comum no
   celular) reencontra a tela "Pedido enviado". Lido uma vez só, ao carregar. */
const pedidoPendente = consumirPedidoEnviado();

/** Ordem da página: produtos → propósito/sobre → contato → rodapé (pagamentos por último). */
export default function Loja() {
  const [busca, setBusca] = useState("");
  const [gaveta, setGaveta] = useState({
    aberta: Boolean(pedidoPendente),
    tela: pedidoPendente ? "enviado" : "itens"
  });
  const [linkPedido, setLinkPedido] = useState(pedidoPendente || "");

  const abrirCarrinho = useCallback(() => setGaveta({ aberta: true, tela: "itens" }), []);
  const fecharCarrinho = useCallback(() => setGaveta((g) => ({ ...g, aberta: false })), []);
  const irPara = useCallback((tela) => setGaveta((g) => ({ ...g, tela })), []);
  const aoEnviarPedido = useCallback((url) => {
    setLinkPedido(url);
    setGaveta((g) => ({ ...g, tela: "enviado" }));
  }, []);

  return (
    <>
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Cabecalho busca={busca} onBuscar={setBusca} onAbrirCarrinho={abrirCarrinho} />

      <main id="conteudo">
        <SecaoProdutos busca={busca} />
        <Divisor />
        <SecaoSobre />
        <SecaoContato />
      </main>

      <Rodape />

      <CarrinhoFlutuante visivel={!gaveta.aberta} onAbrir={abrirCarrinho} />
      <GavetaCarrinho
        aberta={gaveta.aberta}
        tela={gaveta.tela}
        linkPedido={linkPedido}
        onIrPara={irPara}
        onFechar={fecharCarrinho}
        onPedidoEnviado={aoEnviarPedido}
      />
    </>
  );
}
