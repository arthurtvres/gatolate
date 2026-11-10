import { useConfigLoja } from "../../hooks/useConfigLoja";
import { textoAviso } from "../../utils/configLoja";
import Icone from "../ui/Icone";

/** Faixa no topo da loja com o aviso das configurações (ex.: "Sem entregas no feriado"). */
export default function AvisoLoja() {
  const texto = textoAviso(useConfigLoja());
  if (!texto) return null;

  return (
    <div className="aviso-loja container" role="status">
      <p className="aviso-loja__caixa">
        <Icone nome="gato" className="aviso-loja__gato" />
        <span>{texto}</span>
      </p>
    </div>
  );
}
