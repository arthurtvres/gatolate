import { useCarrinho } from "../../hooks/useCarrinho";

/** Bolinha com a quantidade de itens. Dá um "pulinho" a cada produto adicionado. */
export default function Contador() {
  const { resumo, pulos } = useCarrinho();
  return (
    // A key muda a cada adição, o React recria o elemento e a animação recomeça
    <span key={pulos} className={`contador${pulos ? " pulo" : ""}`} aria-hidden="true">
      {resumo.quantidade}
    </span>
  );
}
