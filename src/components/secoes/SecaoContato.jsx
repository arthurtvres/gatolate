import CONFIG from "../../config/loja";
import { linkWhatsApp } from "../../utils/whatsapp";
import Icone from "../ui/Icone";
import TituloDecorado from "../ui/TituloDecorado";

export default function SecaoContato() {
  const saudacao = CONFIG.textos.saudacaoContato || `Olá, ${CONFIG.nomeLoja}!`;

  return (
    <section className="contato container" id="contato" aria-labelledby="titulo-contato">
      <TituloDecorado id="titulo-contato" className="titulo-medio">
        Contato
      </TituloDecorado>
      <p className="contato__chamada">Ficou com alguma dúvida ou quer um pedido especial? Chama a gente!</p>

      <a className="btn btn--whatsapp btn--grande" href={linkWhatsApp(saudacao)} target="_blank" rel="noopener">
        <Icone nome="whatsapp" />
        Falar no WhatsApp
      </a>

      <ul className="contato__infos">
        {CONFIG.instagram && (
          <li>
            <Icone nome="instagram" />
            <a href={CONFIG.instagram} target="_blank" rel="noopener">
              {CONFIG.instagramUsuario || CONFIG.instagram}
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}
