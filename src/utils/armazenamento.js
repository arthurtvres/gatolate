/* Salvar dados no navegador.
   localStorage/sessionStorage podem falhar (navegação anônima, sem espaço).
   Nesses casos o site segue funcionando, só não guarda os dados. */

export const CHAVES = {
  carrinho: "gatolate:carrinho",
  cliente: "gatolate:cliente",
  pedidoEnviado: "gatolate:pedido-enviado",
  meusPedidos: "gatolate:meus-pedidos",
  produtos: "gatolate:produtos",
  config: "gatolate:config"
};

/** Lê um valor salvo (JSON). Devolve `padrao` se não houver ou der erro. */
export function lerLocal(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

export function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* bloqueado ou cheio */
  }
}

/** Dados que só valem enquanto a aba estiver aberta. */
export const sessao = {
  gravar(chave, valor) {
    try {
      sessionStorage.setItem(chave, valor);
    } catch {
      /* bloqueado */
    }
  },
  /** Lê e já apaga (para usar uma vez só). */
  consumir(chave) {
    try {
      const valor = sessionStorage.getItem(chave);
      sessionStorage.removeItem(chave);
      return valor;
    } catch {
      return null;
    }
  }
};
