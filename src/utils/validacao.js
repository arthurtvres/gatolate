/* Regras do formulário de pedido.
   Cada regra recebe (valor, dados) e devolve "" (ok) ou a mensagem de erro. */

const ehEntrega = (dados) => dados.tipo === "entrega";

const obrigatorioNaEntrega = (mensagem) => (valor, dados) =>
  !ehEntrega(dados) || valor.trim() !== "" ? "" : mensagem;

export const REGRAS = {
  nome: (v) => (v.trim().length >= 2 ? "" : "Conta pra gente seu nome 😊"),
  telefone: (v) =>
    /^\d{10,11}$/.test(v.replace(/\D/g, "")) ? "" : "Digite o telefone com DDD, ex.: (11) 98888-7777",
  rua: obrigatorioNaEntrega("Qual é a rua para a entrega?"),
  numero: obrigatorioNaEntrega("Falta o número"),
  bairro: obrigatorioNaEntrega("Falta o bairro")
};

/** Erro de um campo ("" se estiver ok ou se o campo não tiver regra). */
export const validarCampo = (nome, dados) => (REGRAS[nome] ? REGRAS[nome](dados[nome] ?? "", dados) : "");

/** Todos os erros: { nome: "mensagem", ... } (só os campos com erro). */
export function validarFormulario(dados) {
  const erros = {};
  Object.keys(REGRAS).forEach((nome) => {
    const erro = validarCampo(nome, dados);
    if (erro) erros[nome] = erro;
  });
  return erros;
}
