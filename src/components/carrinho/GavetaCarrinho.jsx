import { useEffect, useRef, useState } from "react";
import { useCarrinho } from "../../hooks/useCarrinho";
import { useToast } from "../../hooks/useToast";
import { usePrenderFoco } from "../../hooks/usePrenderFoco";
import Icone from "../ui/Icone";
import FormularioPedido from "./FormularioPedido";
import ListaCarrinho from "./ListaCarrinho";
import PedidoEnviado from "./PedidoEnviado";

const TITULOS = { itens: "Seu carrinho", checkout: "Finalizar pedido", enviado: "Obrigado! ♥" };

/**
 * Gaveta lateral do carrinho, com 3 telas: itens → checkout → enviado.
 * Fica sempre montada (só escondida) para o formulário não perder o que foi digitado.
 */
export default function GavetaCarrinho({ aberta, tela, linkPedido, onIrPara, onFechar, onPedidoEnviado }) {
  const { limpar } = useCarrinho();
  const mostrarToast = useToast();
  const gavetaRef = useRef(null);
  const tituloRef = useRef(null);
  // Trocar a key recria o formulário (limpa data/observações e recarrega os dados salvos)
  const [versaoFormulario, setVersaoFormulario] = useState(0);

  usePrenderFoco(gavetaRef, aberta, onFechar);

  // Trava a rolagem da página por trás da gaveta
  useEffect(() => {
    document.body.classList.toggle("travado", aberta);
  }, [aberta]);

  // A cada tela, o foco vai para o título (leitores de tela anunciam a mudança)
  useEffect(() => {
    if (!aberta) return;
    tituloRef.current.focus();
    gavetaRef.current.querySelectorAll(".gaveta__tela").forEach((el) => {
      el.scrollTop = 0;
    });
  }, [aberta, tela]);

  function limparCarrinho() {
    limpar();
    setVersaoFormulario((v) => v + 1);
    onFechar();
    mostrarToast("Carrinho limpo. Até a próxima! ♥");
  }

  const focarTitulo = () => tituloRef.current.focus();

  return (
    <>
      <div className="sombra" hidden={!aberta} onClick={onFechar} />

      <aside
        ref={gavetaRef}
        className="gaveta"
        id="carrinho"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gaveta-titulo"
        hidden={!aberta}
      >
        <header className="gaveta__topo">
          <button
            className="icone-btn icone-btn--claro"
            type="button"
            aria-label="Voltar para o carrinho"
            hidden={tela !== "checkout"}
            onClick={() => onIrPara("itens")}
          >
            <Icone nome="voltar" />
          </button>
          <h2 id="gaveta-titulo" ref={tituloRef} className="manuscrito" tabIndex={-1}>
            {TITULOS[tela]}
          </h2>
          <button className="icone-btn icone-btn--claro" type="button" aria-label="Fechar carrinho" onClick={onFechar}>
            <Icone nome="fechar" />
          </button>
        </header>

        <div className="gaveta__tela" hidden={tela !== "itens"}>
          <ListaCarrinho
            onFinalizar={() => onIrPara("checkout")}
            onFechar={onFechar}
            onItemRemovido={focarTitulo}
          />
        </div>

        <div className="gaveta__tela" hidden={tela !== "checkout"}>
          <FormularioPedido
            key={versaoFormulario}
            onVazio={() => onIrPara("itens")}
            onEditarItens={() => onIrPara("itens")}
            onEnviado={onPedidoEnviado}
          />
        </div>

        <div className="gaveta__tela gaveta__tela--enviado" hidden={tela !== "enviado"}>
          <PedidoEnviado linkPedido={linkPedido} onLimpar={limparCarrinho} onFechar={onFechar} />
        </div>
      </aside>
    </>
  );
}
