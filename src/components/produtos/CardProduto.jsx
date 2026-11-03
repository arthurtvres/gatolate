import { useCarrinho } from "../../hooks/useCarrinho";
import { useToast } from "../../hooks/useToast";
import Icone from "../ui/Icone";
import FotoProduto from "./FotoProduto";
import PrecoProduto from "./PrecoProduto";

/**
 * Card do produto. Clicar em qualquer parte dele abre o modal com os detalhes
 * (o botão do nome "se estica" por cima do card via CSS).
 * O botão "Adicionar ao carrinho" fica por cima e adiciona direto.
 */
export default function CardProduto({ produto, onAbrir }) {
  const { adicionar } = useCarrinho();
  const mostrarToast = useToast();

  function aoAdicionar() {
    adicionar(produto.id);
    mostrarToast("Adicionado ao carrinho ♥");
  }

  return (
    <li className="card">
      <div className="card__foto">
        <FotoProduto produto={produto} />
      </div>
      <div className="card__info">
        <h3 className="card__nome">
          <Icone nome="coracao" />
          <button className="card__abrir" type="button" onClick={() => onAbrir(produto)}>
            <span className="sr-only">Ver detalhes: </span>
            {produto.nome}
          </button>
        </h3>
        <p className="card__preco">
          <PrecoProduto produto={produto} />
        </p>
        {produto.descricao && <p className="card__descricao">{produto.descricao}</p>}
        <button className="btn" type="button" onClick={aoAdicionar}>
          <Icone nome="carrinho" />
          {/* um só elemento de texto: o espaço entre as palavras fica normal */}
          <span>
            Adicionar<span className="btn__extra"> ao carrinho</span>
          </span>
          <span className="sr-only">: {produto.nome}</span>
        </button>
      </div>
    </li>
  );
}
