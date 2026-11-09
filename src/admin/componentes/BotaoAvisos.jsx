import { Bell, BellOff, BellRing } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import { destravarSom, pedirPermissaoNotificacao, permissaoNotificacao, tocarAviso } from "../utils/avisos";

const ESTADOS = {
  granted: { Icone: BellRing, rotulo: "Avisos ativos", dica: "Você recebe som e notificação a cada pedido novo" },
  denied: {
    Icone: BellOff,
    rotulo: "Notificações bloqueadas",
    dica: "O som e o aviso na tela continuam. Clique para ver como liberar as notificações."
  },
  default: { Icone: Bell, rotulo: "Ativar avisos", dica: "Receber notificação a cada pedido novo" }
};

const TEMPO_LEITURA = 7000;

/** Por que o navegador bloqueou e o que fazer. */
function comoLiberar() {
  if (!window.isSecureContext) {
    return "Notificações só funcionam com https ou em localhost. O som e o aviso na tela continuam funcionando.";
  }
  return "Clique no ícone ao lado do endereço do site → Notificações → Permitir, e recarregue a página.";
}

/** Liga as notificações de pedido novo (o navegador só pergunta depois de um clique). */
export default function BotaoAvisos() {
  const mostrarToast = useToast();
  const [permissao, setPermissao] = useState(permissaoNotificacao);
  if (permissao === "indisponivel") return null; // o som e o aviso na tela continuam funcionando

  const { Icone, rotulo, dica } = ESTADOS[permissao];

  async function aoClicar() {
    destravarSom();
    tocarAviso(); // som de teste: confirma que o volume está ligado

    if (permissao === "denied") {
      mostrarToast(comoLiberar(), TEMPO_LEITURA);
      return;
    }
    if (permissao === "default") {
      const nova = await pedirPermissaoNotificacao();
      setPermissao(nova);
      if (nova === "denied") mostrarToast(comoLiberar(), TEMPO_LEITURA);
    }
  }

  return (
    <button
      className={`admin-botao admin-botao--claro admin-avisos admin-avisos--${permissao}`}
      type="button"
      title={dica}
      onClick={aoClicar}
    >
      <Icone aria-hidden="true" />
      <span className="admin-avisos__rotulo">{rotulo}</span>
    </button>
  );
}
