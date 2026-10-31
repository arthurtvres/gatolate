/* Barras horizontais ordenadas (maior primeiro), uma cor só,
   com o valor escrito na ponta — sem precisar passar o mouse. */
export default function RankingBarras({ titulo, descricao, itens, formatarValor, formatarDetalhe, vazio }) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor));

  return (
    <figure className="admin-grafico">
      <figcaption>
        <h2 className="admin-grafico__titulo">{titulo}</h2>
        {descricao && <p className="admin-grafico__descricao">{descricao}</p>}
      </figcaption>

      {itens.length === 0 ? (
        <p className="admin-vazio">{vazio}</p>
      ) : (
        <ol className="admin-ranking">
          {itens.map((item) => (
            <li key={item.id} className="admin-ranking__linha">
              <span className="admin-ranking__nome">{item.nome}</span>
              <span className="admin-ranking__trilha">
                <span className="admin-ranking__barra" style={{ width: `${(item.valor / maximo) * 100}%` }} />
                <span className="admin-ranking__valor">{formatarValor(item.valor)}</span>
              </span>
              {formatarDetalhe && <span className="admin-ranking__detalhe">{formatarDetalhe(item)}</span>}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
