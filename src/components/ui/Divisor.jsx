import Icone from "./Icone";

/** Linha rosa ondulada com coração no meio. */
export default function Divisor() {
  return (
    <div className="divisor container" aria-hidden="true">
      <span className="divisor__linha" />
      <Icone nome="coracao" />
      <span className="divisor__linha" />
    </div>
  );
}
