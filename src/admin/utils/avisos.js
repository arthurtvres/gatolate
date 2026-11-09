/* Som e notificação do navegador para pedido novo no painel.

   Os navegadores só deixam tocar som depois que a pessoa interage com a página
   (um clique ou tecla). Por isso o som é "destravado" no primeiro clique. */

let contextoAudio = null;

function obterAudio() {
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return null;
  contextoAudio ??= new Contexto();
  return contextoAudio;
}

/** Libera o som (chame dentro de um clique ou tecla). */
export function destravarSom() {
  obterAudio()?.resume();
}

/** "Plim-plom": duas notas curtas, geradas na hora (sem arquivo de áudio). */
export function tocarAviso() {
  const audio = obterAudio();
  if (!audio || audio.state !== "running") return;

  const notas = [
    { frequencia: 880, inicio: 0 },
    { frequencia: 1320, inicio: 0.18 }
  ];
  notas.forEach(({ frequencia, inicio }) => {
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    const comeco = audio.currentTime + inicio;
    oscilador.type = "sine";
    oscilador.frequency.value = frequencia;
    volume.gain.setValueAtTime(0.0001, comeco);
    volume.gain.exponentialRampToValueAtTime(0.3, comeco + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, comeco + 0.45);
    oscilador.connect(volume).connect(audio.destination);
    oscilador.start(comeco);
    oscilador.stop(comeco + 0.5);
  });
}

export const notificacoesSuportadas = () => "Notification" in window;

/** "granted" | "denied" | "default" | "indisponivel" */
export const permissaoNotificacao = () => (notificacoesSuportadas() ? Notification.permission : "indisponivel");

/** Pede permissão para notificações (precisa vir de um clique). Devolve a permissão final. */
export async function pedirPermissaoNotificacao() {
  if (!notificacoesSuportadas()) return "indisponivel";
  return Notification.requestPermission();
}

/**
 * Notificação do sistema, só quando o painel não está na tela
 * (com a aba aberta, o som e o aviso na página já bastam).
 */
export function notificar({ titulo, corpo, etiqueta, icone, aoClicar }) {
  if (permissaoNotificacao() !== "granted" || document.visibilityState === "visible") return;
  try {
    const notificacao = new Notification(titulo, { body: corpo, tag: etiqueta, icon: icone });
    notificacao.onclick = () => {
      window.focus();
      aoClicar?.();
      notificacao.close();
    };
  } catch {
    // Alguns celulares só permitem notificação via service worker; o som e o aviso continuam funcionando
  }
}
