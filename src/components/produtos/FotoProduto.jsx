import { useState } from "react";
import { caminhoPublico } from "../../utils/produtos";
import Icone from "../ui/Icone";

/* Fotos que não carregaram: evita tentar de novo (ex.: miniatura no carrinho). */
const fotosQuebradas = new Set();

/**
 * Foto do produto. Se a imagem não existir, mostra um fundo marrom/rosa
 * com o gatinho e o nome. `mini` = versão pequena (miniatura do carrinho).
 */
export default function FotoProduto({ produto, mini = false }) {
  const [quebrada, setQuebrada] = useState(() => !produto.imagem || fotosQuebradas.has(produto.imagem));

  if (quebrada) {
    return (
      <div
        className={`foto-reserva${mini ? " foto-reserva--mini" : ""}`}
        role={mini ? undefined : "img"}
        aria-label={mini ? undefined : produto.nome}
      >
        <Icone nome="gato" />
        <span>{produto.nome}</span>
      </div>
    );
  }

  return (
    <img
      src={caminhoPublico(produto.imagem)}
      alt={mini ? "" : [produto.nome, produto.descricao].filter(Boolean).join(" — ")}
      loading="lazy"
      decoding="async"
      onError={() => {
        fotosQuebradas.add(produto.imagem);
        setQuebrada(true);
      }}
    />
  );
}
