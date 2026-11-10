import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import CONFIG from "../config/loja";
import { caminhoPublico } from "../utils/produtos";
import { linkWhatsApp } from "../utils/whatsapp";
import "../styles/secoes/privacidade.css";

/** Aviso de privacidade (LGPD), em linguagem simples. Aberto pelo link do formulário de pedido. */
export default function Privacidade() {
  useEffect(() => {
    document.title = `Privacidade · ${CONFIG.nomeLoja}`;
  }, []);

  const contato = linkWhatsApp(`Olá, ${CONFIG.nomeLoja}! Quero falar sobre os meus dados.`);

  return (
    <div className="acompanhar">
      <header className="acompanhar__topo">
        <Link className="acompanhar__voltar" to="/">
          <ArrowLeft aria-hidden="true" />
          Voltar para a loja
        </Link>
        <img className="acompanhar__logo" src={caminhoPublico("logo.png")} alt={CONFIG.nomeLoja} width="64" height="64" />
      </header>

      <main className="privacidade">
        <h1 className="manuscrito">Seus dados com a {CONFIG.nomeLoja}</h1>
        <p className="privacidade__resumo">
          Usamos seus dados só para preparar e entregar o seu pedido. Não vendemos nem passamos para ninguém.
        </p>

        <section>
          <h2>O que pedimos</h2>
          <p>
            Nome, telefone e, na entrega, o endereço. Também guardamos o que você escolheu, a forma de pagamento e as
            observações do pedido.
          </p>
        </section>

        <section>
          <h2>Para que usamos</h2>
          <p>
            Para preparar o pedido, combinar a entrega ou retirada e falar com você pelo WhatsApp sobre ele. Nada de
            propaganda sem você pedir.
          </p>
        </section>

        <section>
          <h2>Onde ficam</h2>
          <p>
            Num banco de dados protegido, que só a {CONFIG.nomeLoja} acessa. O pedido também é enviado pelo WhatsApp,
            que segue a política de privacidade dele.
          </p>
          <p>
            Para evitar pedidos falsos, registramos por 24 horas o telefone e o endereço de internet (IP) de quem faz o
            pedido. Depois disso o registro é apagado sozinho.
          </p>
        </section>

        <section>
          <h2>No seu celular ou computador</h2>
          <p>
            O site guarda no seu navegador o carrinho, seus dados do último pedido (para você não digitar tudo de novo)
            e o link para acompanhar seus pedidos. Não usamos cookies de propaganda nem de rastreamento.
          </p>
        </section>

        <section>
          <h2>Seus direitos</h2>
          <p>
            Você pode pedir para ver, corrigir ou apagar seus dados quando quiser. É só{" "}
            <a href={contato} target="_blank" rel="noopener">
              chamar a gente no WhatsApp
            </a>
            .
          </p>
        </section>

        <p className="privacidade__data">Atualizado em novembro de 2026.</p>
      </main>
    </div>
  );
}
