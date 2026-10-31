import { useEffect, useRef, useState } from "react";
import { useCarrinho } from "../../hooks/useCarrinho";
import { useToast } from "../../hooks/useToast";
import { QTD_MAXIMA } from "../../utils/carrinho";
import { moeda } from "../../utils/formatacao";
import { temPreco } from "../../utils/produtos";
import Icone from "../ui/Icone";
import FotoProduto from "./FotoProduto";
import PrecoProduto from "./PrecoProduto";

/**
 * Detalhes do produto num <dialog> nativo do navegador, que já cuida de:
 * prender o foco, fechar com Esc, fundo escuro e devolver o foco ao fechar.
 * O componente pai troca a `key` a cada produto, então a quantidade sempre começa em 1.
 */
export default function ModalProduto({ produto, onFechar }) {
  const dialogRef = useRef(null);
  const [quantidade, setQuantidade] = useState(1);
  const { adicionar } = useCarrinho();
  const mostrarToast = useToast();

  // Abre/fecha o <dialog> conforme o produto e trava a rolagem da página por trás
  useEffect(() => {
    const dialog = dialogRef.current;
    if (produto && !dialog.open) dialog.showModal();
    if (!produto && dialog.open) dialog.close();
    document.body.classList.toggle("travado", Boolean(produto));
  }, [produto]);

  // Fecha o <dialog> (devolve o foco ao card) e avisa o pai na hora.
  // Não dependemos só do evento "close", que o navegador dispara depois, de forma assíncrona.
  const fechar = () => {
    dialogRef.current?.close();
    onFechar();
  };

  // Esc: assume o fechamento para seguir o mesmo caminho dos botões
  const aoCancelar = (e) => {
    e.preventDefault();
    fechar();
  };

  // Clique no fundo escuro (fora do conteúdo) fecha
  const aoClicar = (e) => {
    if (e.target === dialogRef.current) fechar();
  };

  function aoAdicionar() {
    adicionar(produto.id, quantidade);
    mostrarToast(quantidade > 1 ? `${quantidade} adicionados ao carrinho ♥` : "Adicionado ao carrinho ♥");
    fechar();
  }

  const informacoes = produto?.informacoes || [];

  return (
    <dialog
      ref={dialogRef}
      className="modal-produto"
      aria-labelledby="modal-produto-titulo"
      onCancel={aoCancelar}
      onClose={onFechar}
      onClick={aoClicar}
    >
      {produto && (
        <div className="modal-produto__conteudo">
          <button className="icone-btn icone-btn--claro modal-produto__fechar" type="button" aria-label="Fechar" onClick={fechar}>
            <Icone nome="fechar" />
          </button>

          <div className="modal-produto__foto">
            <FotoProduto produto={produto} />
          </div>

          <div className="modal-produto__info">
            <h2 id="modal-produto-titulo" className="manuscrito modal-produto__nome">
              <Icone nome="coracao" />
              {produto.nome}
            </h2>
            <p className="modal-produto__preco">
              <PrecoProduto produto={produto} />
            </p>

            {produto.descricao && <p className="modal-produto__descricao">{produto.descricao}</p>}
            {produto.detalhes && <p className="modal-produto__detalhes">{produto.detalhes}</p>}

            {informacoes.length > 0 && (
              <ul className="modal-produto__lista">
                {informacoes.map((info) => (
                  <li key={info}>
                    <Icone nome="coracao-cheio" />
                    {info}
                  </li>
                ))}
              </ul>
            )}

            <div className="modal-produto__comprar">
              <div className="quantidade" role="group" aria-label="Quantidade">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  disabled={quantidade <= 1}
                  onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                >
                  <Icone nome="menos" />
                </button>
                <output aria-live="polite">{quantidade}</output>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  disabled={quantidade >= QTD_MAXIMA}
                  onClick={() => setQuantidade((q) => Math.min(QTD_MAXIMA, q + 1))}
                >
                  <Icone nome="mais" />
                </button>
              </div>

              <button className="btn modal-produto__adicionar" type="button" onClick={aoAdicionar}>
                <Icone nome="carrinho" />
                Adicionar
                {temPreco(produto) && <span className="modal-produto__total">{moeda(produto.preco * quantidade)}</span>}
              </button>
            </div>

            {!temPreco(produto) && (
              <p className="nota">O valor é combinado com a gente pelo WhatsApp depois do pedido 💬</p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
