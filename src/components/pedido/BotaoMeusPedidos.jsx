import { ChevronRight, Receipt } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { caminhoAcompanhar, meusPedidos } from "../../utils/meusPedidos";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/**
 * Botão do cabeçalho para voltar ao acompanhamento sem o link.
 * 1 pedido: vai direto para ele. Vários: abre uma listinha.
 * Só aparece se este navegador já fez algum pedido.
 * (O cabeçalho troca a `key` a cada pedido enviado, para reler a lista.)
 */
export default function BotaoMeusPedidos() {
  const [aberto, setAberto] = useState(false);
  const caixaRef = useRef(null);
  const [lista] = useState(meusPedidos);

  // Fecha clicando fora ou com Esc
  useEffect(() => {
    if (!aberto) return undefined;
    const aoClicar = (e) => {
      if (!caixaRef.current?.contains(e.target)) setAberto(false);
    };
    const aoTeclar = (e) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  if (lista.length === 0) return null;

  if (lista.length === 1) {
    return (
      <Link className="icone-btn" to={caminhoAcompanhar(lista[0].token)} aria-label={`Acompanhar pedido #${lista[0].codigo}`} title="Meu pedido">
        <Receipt aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="meus-pedidos" ref={caixaRef}>
      <button
        className="icone-btn"
        type="button"
        aria-label="Meus pedidos"
        title="Meus pedidos"
        aria-expanded={aberto}
        aria-controls="meus-pedidos-lista"
        onClick={() => setAberto(!aberto)}
      >
        <Receipt aria-hidden="true" />
      </button>

      {aberto && (
        <div className="meus-pedidos__caixa" id="meus-pedidos-lista">
          <p className="meus-pedidos__titulo">Meus pedidos</p>
          <ul>
            {lista.map((pedido) => (
              <li key={pedido.token}>
                <Link to={caminhoAcompanhar(pedido.token)}>
                  <span>
                    <strong>Pedido #{pedido.codigo}</strong>
                    <small>{data.format(new Date(pedido.criadoEm))}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
