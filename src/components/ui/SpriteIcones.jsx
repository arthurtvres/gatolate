import sprite from "../../assets/icones.svg?raw";

/**
 * Coloca todos os ícones (e o filtro "pincel") na página uma única vez.
 * Depois cada <Icone /> só aponta para o desenho com <use href="#i-...">.
 * Não usa display:none de propósito: o filtro SVG pararia de funcionar.
 */
export default function SpriteIcones() {
  return <div className="sprite" aria-hidden="true" dangerouslySetInnerHTML={{ __html: sprite }} />;
}
