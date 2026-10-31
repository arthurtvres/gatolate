/** Ícone do sprite (src/assets/icones.svg). Ex.: <Icone nome="carrinho" /> */
export default function Icone({ nome, className }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`#i-${nome}`} />
    </svg>
  );
}
