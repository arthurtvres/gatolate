import { PawPrint } from "lucide-react";
import { useMemo, useState } from "react";
import CONFIG from "../../config/loja";
import { useProdutos } from "../../hooks/useProdutos";
import { normalizar } from "../../utils/formatacao";
import Icone from "../ui/Icone";
import TituloDecorado from "../ui/TituloDecorado";
import CardMomento from "./CardMomento";
import CardProduto from "./CardProduto";
import ModalProduto from "./ModalProduto";

/** Primeira seção do site: é o que mais se acessa no celular. */
export default function SecaoProdutos({ busca }) {
  const { produtos: todos, carregando, erro, recarregar } = useProdutos();
  const [produtoAberto, setProdutoAberto] = useState(null);

  // Filtra pelo nome e pela descrição, ignorando acentos e maiúsculas
  const produtos = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return todos;
    return todos.filter((p) => normalizar(`${p.nome} ${p.descricao || ""}`).includes(termo));
  }, [busca, todos]);

  let aviso = null;
  if (carregando) aviso = <>Tirando os brownies do forno... <PawPrint aria-hidden="true" /></>;
  else if (erro) aviso = "Não conseguimos carregar os brownies agora.";
  else if (produtos.length === 0) aviso = busca.trim() ? <>Nenhum brownie com esse nome... <PawPrint aria-hidden="true" /> Tente outra palavra!</> : "Nenhum brownie disponível no momento.";

  return (
    <section className="produtos container" id="produtos" aria-labelledby="titulo-produtos" aria-busy={carregando}>
      <header className="secao-titulo">
        <TituloDecorado como="h1" id="titulo-produtos">
          Nossos Brownies
        </TituloDecorado>
        <p className="manuscrito">
          <Icone nome="coracao" />
          <span>{CONFIG.textos.subtituloProdutos}</span>
          <Icone nome="coracao" />
        </p>
      </header>

      <ul className="grade-produtos">
        {produtos.map((produto) => (
          <CardProduto key={produto.id} produto={produto} onAbrir={setProdutoAberto} />
        ))}
      </ul>
      {aviso && (
        <div className="sem-resultado" role="status">
          <p>{aviso}</p>
          {erro && (
            <button className="btn" type="button" onClick={recarregar}>
              Tentar de novo
            </button>
          )}
        </div>
      )}

      {/* Celular: pequeno, embaixo dos produtos. Computador: no canto superior direito (via CSS). */}
      <CardMomento />

      <ModalProduto
        key={produtoAberto?.id ?? "fechado"}
        produto={produtoAberto}
        onFechar={() => setProdutoAberto(null)}
      />
    </section>
  );
}
