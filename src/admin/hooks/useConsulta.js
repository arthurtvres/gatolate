import { useCallback, useEffect, useState } from "react";

/**
 * Carrega dados assíncronos e refaz a busca quando `chave` muda.
 * Enquanto recarrega, mantém os dados anteriores na tela (sem "piscar").
 *
 *   const { dados, carregando, erro, recarregar, alterarDados } =
 *     useConsulta(() => listarPedidos(desde), `pedidos-${periodo}`);
 */
export function useConsulta(buscar, chave) {
  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState({ chave: null, dados: null, erro: "" });
  const chaveAtual = `${chave}#${versao}`;

  useEffect(() => {
    let ativo = true;
    buscar().then(
      (dados) => ativo && setResultado({ chave: chaveAtual, dados, erro: "" }),
      (erro) => ativo && setResultado((r) => ({ chave: chaveAtual, dados: r.dados, erro: erro.message }))
    );
    return () => {
      ativo = false;
    };
    // `buscar` muda a cada render; a busca só deve refazer quando a chave mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAtual]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  /** Atualiza os dados na tela sem buscar de novo (ex.: depois de salvar um item). */
  const alterarDados = useCallback((fn) => setResultado((r) => ({ ...r, dados: fn(r.dados) })), []);

  return {
    dados: resultado.dados,
    erro: resultado.erro,
    carregando: resultado.chave !== chaveAtual,
    recarregar,
    alterarDados
  };
}
