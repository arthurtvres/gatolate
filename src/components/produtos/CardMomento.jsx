import CONFIG from "../../config/loja";
import Icone from "../ui/Icone";

/** Card decorativo "É mais que um brownie... É um momento especial! ♥" */
export default function CardMomento() {
  return (
    <aside className="momento" aria-label={`Mensagem da ${CONFIG.nomeLoja}`}>
      <Icone nome="gato" className="momento__gato" />
      <Icone nome="coracao-cheio" className="momento__coracao" />
      <p className="pincel pincel--momento manuscrito">
        <span>{CONFIG.textos.momentoLinha1}</span>
        <span>{CONFIG.textos.momentoLinha2}</span>
        <Icone nome="coracao-cheio" className="coracaozinho" />
      </p>
    </aside>
  );
}
