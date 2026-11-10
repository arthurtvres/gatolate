/* Configurações da loja que a dona edita no painel (textos, pagamentos, bairros, aviso).
   Funções puras: o ConfigLojaProvider busca no banco e usa estas regras para
   completar o que faltar com os valores de src/config/loja.js. */
import BAIRROS from "../config/bairros";
import CONFIG from "../config/loja";

/** Valores do código: usados no modo demonstração e enquanto o banco não responde. */
export const configPadrao = () => ({
  textos: { ...CONFIG.textos },
  beneficios: CONFIG.beneficios,
  pagamentos: CONFIG.pagamentos,
  aviso: "",
  pedidosPausados: false,
  bairros: BAIRROS.map((nome) => ({ nome, taxa: null }))
});

const ehTexto = (v) => typeof v === "string";
const listaDe = (valor, valido) => (Array.isArray(valor) ? valor.filter(valido) : []);

/**
 * Junta o que veio do banco com o padrão, descartando dados malformados.
 * banco: resultado de buscarConfiguracoes() (ou null) · bairros: listarBairros()
 */
export function mesclarConfig(banco, bairros) {
  const padrao = configPadrao();
  const textos = { ...padrao.textos };
  Object.entries(banco?.textos || {}).forEach(([chave, valor]) => {
    if (chave === "sobre") {
      const paragrafos = listaDe(valor, (p) => ehTexto(p) && p.trim());
      if (paragrafos.length) textos.sobre = paragrafos;
    } else if (ehTexto(valor)) {
      textos[chave] = valor;
    }
  });

  const pagamentos = listaDe(banco?.pagamentos, (p) => ehTexto(p?.nome) && p.nome.trim());

  return {
    textos,
    beneficios: banco ? listaDe(banco.beneficios, (b) => ehTexto(b?.titulo) && ehTexto(b?.icone)) : padrao.beneficios,
    pagamentos: pagamentos.length ? pagamentos : padrao.pagamentos,
    aviso: ehTexto(banco?.aviso) ? banco.aviso : "",
    pedidosPausados: banco?.pedidosPausados === true,
    // A lista do banco vale mesmo vazia (a dona pode ter desativado todos)
    bairros: Array.isArray(bairros)
      ? bairros.filter((b) => b.ativo !== false).map(({ nome, taxa }) => ({ nome, taxa }))
      : padrao.bairros
  };
}

/** Nomes dos bairros atendidos (para a busca e a validação do formulário). */
export const nomesBairros = (bairros) => bairros.map((b) => b.nome);

/** Taxa do bairro, ou null se ele não tiver taxa ("a combinar") ou não estiver na lista. */
export function taxaDoBairro(bairros, nome) {
  const taxa = bairros.find((b) => b.nome === nome)?.taxa;
  return typeof taxa === "number" && taxa > 0 ? taxa : null;
}

/** true se algum bairro já tem taxa definida (muda o texto "Entrega a combinar"). */
export const temTaxas = (bairros) => bairros.some((b) => typeof b.taxa === "number" && b.taxa > 0);

/** Texto da faixa no topo da loja ("" = não mostra). */
export function textoAviso(config) {
  if (config.aviso.trim()) return config.aviso.trim();
  return config.pedidosPausados ? "No momento não estamos recebendo pedidos pelo site. Chama a gente no WhatsApp!" : "";
}
