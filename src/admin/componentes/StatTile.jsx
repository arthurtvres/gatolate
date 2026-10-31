/** Número de destaque: rótulo + valor (+ detalhe opcional). `destaque` = número principal da tela. */
export default function StatTile({ rotulo, valor, detalhe, destaque = false }) {
  return (
    <div className={`admin-stat${destaque ? " admin-stat--destaque" : ""}`}>
      <p className="admin-stat__rotulo">{rotulo}</p>
      <p className="admin-stat__valor">{valor}</p>
      {detalhe && <p className="admin-stat__detalhe">{detalhe}</p>}
    </div>
  );
}
