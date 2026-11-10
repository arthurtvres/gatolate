import { useConfigLoja } from "../../hooks/useConfigLoja";
import Icone from "../ui/Icone";

/** "Nosso propósito" + "Sobre nós". */
export default function SecaoSobre() {
  const { textos } = useConfigLoja();

  return (
    <section className="sobre container" id="sobre" aria-labelledby="titulo-sobre">
      <div className="proposito">
        <div className="proposito__titulo">
          <Icone nome="coracao" className="deco deco--coracao-a" />
          <h2>
            <span className="manuscrito titulo-grande">
              Nosso propósito <Icone nome="risquinhos" className="deco-risco espelhado" />
            </span>
            <span className="proposito__frase manuscrito">{textos.proposito}</span>
          </h2>
          <Icone nome="coracao" className="deco deco--coracao-b" />
          <Icone nome="risquinhos" className="deco deco--risco" />
        </div>
      </div>

      <div className="sobre__cartao">
        <Icone nome="gato" className="sobre__gato" />
        <div>
          <h2 id="titulo-sobre" className="manuscrito titulo-medio">
            Sobre nós <Icone nome="risquinhos" className="deco-risco" />
          </h2>
          <div className="sobre__texto">
            {textos.sobre.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
