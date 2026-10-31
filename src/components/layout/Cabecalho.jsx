import { useEffect, useRef, useState } from "react";
import CONFIG from "../../config/loja";
import { useSecaoAtiva } from "../../hooks/useSecaoAtiva";
import { useCarrinho } from "../../hooks/useCarrinho";
import { caminhoPublico } from "../../utils/produtos";
import { plural } from "../../utils/formatacao";
import Contador from "../ui/Contador";
import Icone from "../ui/Icone";

const LINKS = [
  { id: "produtos", rotulo: "Produtos" },
  { id: "sobre", rotulo: "Sobre nós" },
  { id: "contato", rotulo: "Contato" }
];
const IDS_SECOES = LINKS.map((l) => l.id);

/** Rola até os produtos descontando a altura do cabeçalho fixo. */
function rolarParaProdutos() {
  const secao = document.getElementById("produtos");
  const cabecalho = document.querySelector(".cabecalho");
  const alvo = secao.getBoundingClientRect().top + window.scrollY - cabecalho.offsetHeight - 10;
  window.scrollTo({ top: Math.max(alvo, 0), behavior: "smooth" });
}

export default function Cabecalho({ busca, onBuscar, onAbrirCarrinho }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const jaRolouNaBusca = useRef(false);
  const campoBusca = useRef(null);
  const botaoMenu = useRef(null);
  const botaoBusca = useRef(null);
  const secaoAtiva = useSecaoAtiva(IDS_SECOES);
  const { resumo } = useCarrinho();

  // Esc fecha o menu
  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (e) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        botaoMenu.current.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  // Foca o campo assim que a busca abre
  useEffect(() => {
    if (buscaAberta) campoBusca.current.focus();
  }, [buscaAberta]);

  function alternarBusca() {
    if (buscaAberta) onBuscar("");
    jaRolouNaBusca.current = false;
    setBuscaAberta(!buscaAberta);
  }

  function aoDigitar(e) {
    const termo = e.target.value;
    onBuscar(termo);
    if (!jaRolouNaBusca.current && termo.trim()) {
      jaRolouNaBusca.current = true;
      rolarParaProdutos();
    }
  }

  function aoTeclarNaBusca(e) {
    if (e.key === "Enter") rolarParaProdutos();
    if (e.key === "Escape") {
      alternarBusca();
      botaoBusca.current.focus();
    }
  }

  function abrirCarrinho() {
    setMenuAberto(false);
    onAbrirCarrinho();
  }

  return (
    <header className="cabecalho" id="topo">
      <div className="container cabecalho__barra">
        <a className="logo" href="#topo" aria-label={`${CONFIG.nomeLoja} — voltar ao início`}>
          <img className="logo__imagem" src={caminhoPublico("logo.png")} alt="" width="110" height="110" />
        </a>

        <nav className={`menu${menuAberto ? " aberto" : ""}`} id="menu" aria-label="Menu principal">
          <ul>
            {LINKS.map((link) => {
              const ativo = secaoAtiva === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={ativo ? "ativo" : undefined}
                    aria-current={ativo ? "true" : undefined}
                    onClick={() => setMenuAberto(false)}
                  >
                    {link.rotulo}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="acoes">
          <button
            ref={botaoBusca}
            className="icone-btn"
            type="button"
            aria-label="Buscar produtos"
            aria-expanded={buscaAberta}
            aria-controls="busca"
            onClick={alternarBusca}
          >
            <Icone nome="busca" />
          </button>
          <button
            className="icone-btn"
            type="button"
            aria-label={`Abrir carrinho (${plural(resumo.quantidade, "item", "itens")})`}
            aria-controls="carrinho"
            onClick={abrirCarrinho}
          >
            <Icone nome="carrinho" />
            <Contador />
          </button>
          <button
            ref={botaoMenu}
            className="icone-btn menu-btn"
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Icone nome={menuAberto ? "fechar" : "menu"} />
          </button>
        </div>
      </div>

      <div className="busca" id="busca" hidden={!buscaAberta}>
        <div className="container">
          <label className="busca__campo">
            <Icone nome="busca" />
            <span className="sr-only">Buscar brownie pelo nome</span>
            <input
              ref={campoBusca}
              type="search"
              placeholder="Buscar brownie pelo nome..."
              autoComplete="off"
              value={busca}
              onChange={aoDigitar}
              onKeyDown={aoTeclarNaBusca}
            />
          </label>
        </div>
      </div>
      <div className="onda onda--baixo" aria-hidden="true" />
    </header>
  );
}
