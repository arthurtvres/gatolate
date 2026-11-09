/** Transforma o erro do Supabase numa mensagem legível ("Não foi possível salvar o produto: ..."). */
export function falharSe(error, acao) {
  if (error) throw new Error(`Não foi possível ${acao}: ${error.message}`);
}
