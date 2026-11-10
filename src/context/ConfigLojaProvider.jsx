/* Configurações da loja (textos, pagamentos, bairros, aviso).
   • Com Supabase: vêm do banco (editadas em /admin/configuracoes). Mostra
     primeiro a última versão guardada no navegador e atualiza em seguida.
   • Sem Supabase (modo demonstração): vêm do src/config/loja.js. */
import { useEffect, useState } from "react";
import { supabaseConfigurado } from "../lib/supabase";
import { buscarConfiguracoes, listarBairros } from "../services/configApi";
import { CHAVES, gravarLocal, lerLocal } from "../utils/armazenamento";
import { configPadrao, mesclarConfig } from "../utils/configLoja";
import { ConfigLojaContext } from "./contextos";

function estadoInicial() {
  if (!supabaseConfigurado) return configPadrao();
  const guardada = lerLocal(CHAVES.config, null);
  return guardada ? mesclarConfig(guardada, guardada.bairros) : configPadrao();
}

export function ConfigLojaProvider({ children }) {
  const [config, setConfig] = useState(estadoInicial);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    Promise.all([buscarConfiguracoes(), listarBairros()]).then(
      ([banco, bairros]) => {
        const nova = mesclarConfig(banco, bairros);
        gravarLocal(CHAVES.config, nova);
        if (ativo) setConfig(nova);
      },
      // Sem internet ou banco fora do ar: segue com a versão guardada (ou a padrão)
      (erro) => console.error(erro)
    );
    return () => {
      ativo = false;
    };
  }, []);

  return <ConfigLojaContext.Provider value={config}>{children}</ConfigLojaContext.Provider>;
}
