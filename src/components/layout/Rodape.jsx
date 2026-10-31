import CONFIG from "../../config/loja";
import { iconePagamento } from "../../utils/pagamentos";
import Icone from "../ui/Icone";

/** Rodapé: benefícios e, por último, as formas de pagamento. */
export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="onda onda--cima" aria-hidden="true" />
      <div className="rodape__xadrez rodape__xadrez--esq" aria-hidden="true" />
      <div className="rodape__xadrez rodape__xadrez--dir" aria-hidden="true" />
      <Icone nome="coracao" className="rodape__coracao rodape__coracao--esq" />
      <Icone nome="coracao" className="rodape__coracao rodape__coracao--dir" />

      <div className="container">
        <ul className="faixa-beneficios" aria-label="Nossos diferenciais">
          {CONFIG.beneficios.map((b) => (
            <li key={b.titulo}>
              <Icone nome={b.icone} />
              <span>{b.titulo}</span>
            </li>
          ))}
        </ul>

        <section className="pagamentos" aria-labelledby="titulo-pagamentos">
          <h2 id="titulo-pagamentos" className="manuscrito">
            Formas de pagamento
          </h2>
          <ul className="pagamentos__lista">
            {CONFIG.pagamentos.map((p) => (
              <li key={p.nome}>
                <Icone nome={iconePagamento(p)} />
                {p.nome}
              </li>
            ))}
          </ul>
          <p className="pagamentos__nota">O pagamento é combinado pelo WhatsApp, depois que você envia o pedido.</p>
        </section>

        <p className="rodape__copy">
          © {new Date().getFullYear()} {CONFIG.nomeLoja} · Feito com <span aria-label="amor">♥</span> e muito
          chocolate
        </p>
      </div>
    </footer>
  );
}
