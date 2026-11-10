import CONFIG from "../../config/loja";
import { useConfigLoja } from "../../hooks/useConfigLoja";
import Icone from "../ui/Icone";

/** Card decorativo "É mais que um brownie... É um momento especial! ♥" */
export default function CardMomento() {
  const { textos } = useConfigLoja();
  return (
    <aside className="momento" aria-label={`Mensagem da ${CONFIG.nomeLoja}`}>
      <Icone nome="gato" className="momento__gato" />
      <Icone nome="coracao-cheio" className="momento__coracao" />
      <p className="pincel pincel--momento manuscrito">
        <span>{textos.momentoLinha1}</span>
        <span>{textos.momentoLinha2}</span>
        <Icone nome="coracao-cheio" className="coracaozinho" />
      </p>
    </aside>
  );
}
