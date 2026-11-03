import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useCarrinho } from "../../hooks/useCarrinho";
import { textoNota, textoTotal } from "../../utils/carrinho";
import Icone from "../ui/Icone";
import ItemCarrinho from "./ItemCarrinho";

/** Tela 1 da gaveta: itens + total, ou a mensagem de carrinho vazio. */
export default function ListaCarrinho({ onFinalizar, onFechar, onItemRemovido, onLimpar }) {
  const { resumo } = useCarrinho();
  const [confirmando, setConfirmando] = useState(false);

  if (resumo.quantidade === 0) {
    return (
      <div className="carrinho-vazio">
        <Icone nome="gato" className="carrinho-vazio__gato" />
        <p className="manuscrito">Miau... seu carrinho está vazio!</p>
        <p>O gatinho já está de olho nos brownies. Que tal escolher um?</p>
        <a href="#produtos" className="btn" onClick={onFechar}>
          Ver brownies
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="limpar-carrinho">
        {confirmando ? (
          <div className="limpar-carrinho__confirmar" role="group" aria-label="Confirmar limpeza do carrinho">
            <span>Tirar todos os itens?</span>
            <button
              type="button"
              className="limpar-carrinho__sim"
              onClick={() => {
                setConfirmando(false);
                onLimpar();
              }}
            >
              Limpar
            </button>
            <button type="button" className="limpar-carrinho__nao" onClick={() => setConfirmando(false)} autoFocus>
              Cancelar
            </button>
          </div>
        ) : (
          <button type="button" className="limpar-carrinho__botao" onClick={() => setConfirmando(true)}>
            <Trash2 aria-hidden="true" />
            Limpar carrinho
          </button>
        )}
      </div>

      <ul className="itens">
        {resumo.itens.map((item) => (
          <ItemCarrinho key={item.produto.id} item={item} onRemovido={onItemRemovido} />
        ))}
      </ul>

      <footer className="gaveta__rodape">
        <div className="linha-total">
          <span>Total</span>
          <strong>{textoTotal(resumo)}</strong>
        </div>
        <p className="nota">{textoNota(resumo)}</p>
        <button className="btn btn--cheio" type="button" onClick={onFinalizar}>
          Finalizar pedido
        </button>
        <button className="btn-link" type="button" onClick={onFechar}>
          Continuar comprando
        </button>
      </footer>
    </>
  );
}
