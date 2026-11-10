import { useCallback, useState } from "react";
import CarrinhoFlutuante from "../components/carrinho/CarrinhoFlutuante";
import GavetaCarrinho from "../components/carrinho/GavetaCarrinho";
import Cabecalho from "../components/layout/Cabecalho";
import AvisoLoja from "../components/layout/AvisoLoja";
import Rodape from "../components/layout/Rodape";
import AvisoPedido from "../components/pedido/AvisoPedido";
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
  // Muda a cada pedido enviado: o aviso "Acompanhar pedido" relê o pedido mais recente
  const [versaoPedido, setVersaoPedido] = useState(0);

  const abrirCarrinho = useCallback(() => setGaveta({ aberta: true, tela: "itens" }), []);
  const fecharCarrinho = useCallback(() => setGaveta((g) => ({ ...g, aberta: false })), []);
  const irPara = useCallback((tela) => setGaveta((g) => ({ ...g, tela })), []);
  const aoEnviarPedido = useCallback((url) => {
    setLinkPedido(url);
    setVersaoPedido((v) => v + 1);
    setGaveta((g) => ({ ...g, tela: "enviado" }));
  }, []);

  return (
    <>
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Cabecalho busca={busca} onBuscar={setBusca} onAbrirCarrinho={abrirCarrinho} versaoPedido={versaoPedido} />

      <main id="conteudo">
        <AvisoLoja />
        <AvisoPedido key={versaoPedido} />
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
