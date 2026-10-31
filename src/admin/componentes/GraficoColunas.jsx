import { useEffect, useRef, useState } from "react";

/* Gráfico de colunas de uma série só (ex.: faturamento por dia), em SVG.
   Regras visuais: colunas de até 24px com ponta arredondada (base reta),
   grade fina e discreta, um rótulo só (no maior valor), dica ao passar o
   mouse OU focar pelo teclado, e uma tabela com todos os valores. */

const ALTURA = 240;
const MARGEM = { topo: 26, direita: 8, base: 30, esquerda: 64 };
const LARGURA_MAX_COLUNA = 24;
const ESPACO_ROTULO_X = 48; // px por rótulo no eixo X (evita sobreposição)

/** Passo "redondo" para o eixo: 1, 2, 2,5 ou 5 × 10ⁿ */
function passoRedondo(bruto) {
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const fracao = bruto / potencia;
  const opcoes = [1, 2, 2.5, 5, 10];
  return opcoes.find((o) => fracao <= o) * potencia;
}

/** Topo do eixo e marcações (até 4 intervalos). */
function calcularEixo(maximo) {
  if (maximo <= 0) return { topo: 100, marcas: [0, 25, 50, 75, 100] };
  const passo = passoRedondo(maximo / 4);
  const topo = Math.ceil(maximo / passo) * passo;
  const marcas = [];
  for (let v = 0; v <= topo + passo / 2; v += passo) marcas.push(v);
  return { topo, marcas };
}

/** Caminho da coluna: cantos de cima arredondados (4px), base reta. */
function caminhoColuna(x, y, largura, altura) {
  const r = Math.min(4, altura, largura / 2);
  return `M${x},${y + altura} V${y + r} Q${x},${y} ${x + r},${y} H${x + largura - r} Q${x + largura},${y} ${x + largura},${y + r} V${y + altura} Z`;
}

/** Acompanha a largura do elemento (gráfico responsivo). */
function useLargura(ref) {
  const [largura, setLargura] = useState(640);
  useEffect(() => {
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width));
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [ref]);
  return largura;
}

/**
 * dados: [{ chave, rotulo, valor, detalhe }]
 * formatarValor: valor → texto (dica, rótulo, tabela) · formatarEixo: valor → texto curto
 */
export default function GraficoColunas({ titulo, descricao, dados, formatarValor, formatarEixo, rotuloColuna }) {
  const caixa = useRef(null);
  const largura = useLargura(caixa);
  const [ativo, setAtivo] = useState(null);

  const areaLargura = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 10);
  const areaAltura = ALTURA - MARGEM.topo - MARGEM.base;
  const maximo = Math.max(0, ...dados.map((d) => d.valor));
  const { topo, marcas } = calcularEixo(maximo);
  const faixa = areaLargura / Math.max(dados.length, 1);
  const larguraColuna = Math.max(2, Math.min(LARGURA_MAX_COLUNA, faixa * 0.65));
  const yDe = (valor) => MARGEM.topo + areaAltura - (valor / topo) * areaAltura;
  const saltoRotulo = Math.max(1, Math.ceil(dados.length / (areaLargura / ESPACO_ROTULO_X)));
  const indiceMaior = maximo > 0 ? dados.findIndex((d) => d.valor === maximo) : -1;

  const pontoAtivo = ativo !== null ? dados[ativo] : null;
  const xCentro = (i) => MARGEM.esquerda + faixa * i + faixa / 2;

  return (
    <figure className="admin-grafico">
      <figcaption>
        <h2 className="admin-grafico__titulo">{titulo}</h2>
        {descricao && <p className="admin-grafico__descricao">{descricao}</p>}
      </figcaption>

      <div className="admin-grafico__area" ref={caixa}>
        <svg width={largura} height={ALTURA} role="group" aria-label={titulo}>
          {/* Grade e eixo Y */}
          {marcas.map((marca) => (
            <g key={marca}>
              <line
                className="admin-grafico__grade"
                x1={MARGEM.esquerda}
                x2={largura - MARGEM.direita}
                y1={yDe(marca)}
                y2={yDe(marca)}
              />
              <text className="admin-grafico__eixo" x={MARGEM.esquerda - 8} y={yDe(marca)} dy="0.32em" textAnchor="end">
                {formatarEixo(marca)}
              </text>
            </g>
          ))}

          {dados.map((ponto, i) => {
            const y = yDe(ponto.valor);
            const altura = MARGEM.topo + areaAltura - y;
            const x = xCentro(i) - larguraColuna / 2;
            return (
              <g key={ponto.chave}>
                {altura > 0 && (
                  <path
                    className={`admin-grafico__coluna${ativo === i ? " ativa" : ""}`}
                    d={caminhoColuna(x, y, larguraColuna, altura)}
                  />
                )}
                {/* Rótulo só no maior valor */}
                {i === indiceMaior && (
                  <text className="admin-grafico__valor" x={xCentro(i)} y={y - 8} textAnchor="middle">
                    {formatarValor(ponto.valor)}
                  </text>
                )}
                {i % saltoRotulo === 0 && (
                  <text className="admin-grafico__eixo" x={xCentro(i)} y={ALTURA - 10} textAnchor="middle">
                    {ponto.rotulo}
                  </text>
                )}
                {/* Área de toque: a faixa inteira (maior que a coluna) */}
                <rect
                  className="admin-grafico__alvo"
                  x={MARGEM.esquerda + faixa * i}
                  y={MARGEM.topo}
                  width={faixa}
                  height={areaAltura}
                  tabIndex={0}
                  aria-label={`${ponto.rotulo}: ${formatarValor(ponto.valor)}${ponto.detalhe ? `, ${ponto.detalhe}` : ""}`}
                  onPointerEnter={() => setAtivo(i)}
                  onPointerLeave={() => setAtivo(null)}
                  onFocus={() => setAtivo(i)}
                  onBlur={() => setAtivo(null)}
                />
              </g>
            );
          })}
        </svg>

        {pontoAtivo && (
          <div
            className="admin-grafico__dica"
            style={{ left: Math.min(Math.max(xCentro(ativo), 70), largura - 70), top: yDe(pontoAtivo.valor) - 10 }}
            aria-hidden="true"
          >
            <strong>{formatarValor(pontoAtivo.valor)}</strong>
            <span>
              {pontoAtivo.rotulo}
              {pontoAtivo.detalhe ? ` · ${pontoAtivo.detalhe}` : ""}
            </span>
          </div>
        )}
      </div>

      <details className="admin-grafico__tabela">
        <summary>Ver em tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{rotuloColuna}</th>
              <th scope="col">Valor</th>
              <th scope="col">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((ponto) => (
              <tr key={ponto.chave}>
                <td>{ponto.rotulo}</td>
                <td>{formatarValor(ponto.valor)}</td>
                <td>{ponto.detalhe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
