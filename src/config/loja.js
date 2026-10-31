/* =====================================================================
   CONFIGURAÇÃO DA LOJA — o único arquivo que você precisa editar:
   WhatsApp, produtos, preços, textos, links e formas de pagamento.
   Preços usam PONTO nos centavos (8.50) e cada item da lista termina
   com vírgula.
   ===================================================================== */

const CONFIG = {
  whatsapp: "559991356768",
  nomeLoja: "Gatolate",
  taxaEntrega: 0,
  instagram: "https://instagram.com/gaatolate",
  instagramUsuario: "@gaatolate",
  regiaoEntrega: "Entregamos em toda a cidade. Bairros mais distantes: consulte!",
  textos: {
    subtituloProdutos: "Feitos com muito amor e ingredientes selecionados",
    momentoLinha1: "É mais que um brownie...",
    momentoLinha2: "É um momento especial!",
    proposito: "Transformar momentos simples em doces memórias!",
    sobre: [
      "A Gatolate nasceu na cozinha de casa, entre uma fornada e outra, com a ajuda (nem sempre útil) da nossa gatinha, que vive rondando o forno.",
      "Cada brownie é feito à mão, em pequenas quantidades, com chocolate de qualidade e aquela casquinha crocante que a gente ama. Fazemos também caixas personalizadas para presentes, festas e datas especiais."
    ],
    // Mensagem que já vem escrita quando o cliente clica em "Falar no WhatsApp".
    saudacaoContato: "Olá, Gatolate! Vim pelo site e queria tirar uma dúvida 🐱"
  },

  /* Benefícios mostrados no rodapé (a última parte do site).
     icone: "qualidade", "entrega", "protegida" ou "pagamento". */
  beneficios: [
    { icone: "qualidade", titulo: "Qualidade em cada mordida" },
    { icone: "entrega",   titulo: "Entrega rápida e segura" },
    { icone: "protegida", titulo: "Compra protegida" },
    { icone: "pagamento", titulo: "Diversas formas de pagamento" }
  ],

  /* FORMAS DE PAGAMENTO
     Aparecem no fim do site e como opções no formulário do pedido.
     - nome: como aparece para o cliente.
     - naEntrega: true → vira "Cartão na entrega" ou "Cartão na retirada",
       conforme o cliente escolher.
     A primeira da lista já vem marcada no formulário. */
  pagamentos: [
    { nome: "Pix" },
    { nome: "Dinheiro" },
    { nome: "Cartão", naEntrega: true }
  ],

  /* PRODUTOS
     ⚠️ Com o Supabase configurado, os produtos vêm do BANCO e são editados
     no painel /admin — esta lista NÃO é usada. Ela só vale no modo
     demonstração (sem Supabase) e serviu de base para os produtos iniciais
     do supabase/schema.sql.

     Campos (aparecem nesta ordem no site):
     - id: identificador único, sem espaços nem acentos (não mude depois de publicado).
     - nome: nome no cardápio.
     - descricao: frase curta embaixo do nome.
     - preco: valor em reais (ex.: 8.00). Use null para "Sob consulta".
     - unidade: aparece depois do preço ("unidade", "caixa com 6"...).
     - imagem: foto dentro da pasta public/produtos/. Se a foto não
       existir, o site mostra um fundo bonito com o nome do produto.
     - categoria: só para organização ("brownies", "caixas"...).
     - nomeNoPedido (opcional): nome usado na mensagem do WhatsApp, se
       quiser que seja diferente do nome no cardápio.

     Campos opcionais que aparecem só na janela de detalhes (ao clicar no produto):
     - detalhes: texto mais longo sobre o produto.
     - informacoes: lista de itens curtos (peso, ingredientes, alergênicos...).
     Exemplo:
       { id: "tradicional", ..., detalhes: "Massa fudge com chocolate meio amargo...",
         informacoes: ["Aprox. 80 g", "Contém glúten, leite e ovos"] } */
  produtos: [
    { id: "tradicional", nome: "Tradicional", descricao: "Brownie clássico com casquinha", preco: 8.00, unidade: "unidade", imagem: "produtos/tradicional.jpg", categoria: "brownies" },
    { id: "recheado", nome: "Recheados", descricao: "Recheio cremoso de brigadeiro", preco: 10.00, unidade: "unidade", imagem: "produtos/recheado.jpg", categoria: "brownies" },
    { id: "especial", nome: "Especiais", descricao: "Cobertura de chocolate branco e Oreo", preco: 12.00, unidade: "unidade", imagem: "produtos/especial.jpg", categoria: "brownies" },
    { id: "caixa", nome: "Pedidos", descricao: "Caixas personalizadas", preco: null, unidade: "", imagem: "produtos/caixa.jpg", categoria: "caixas", nomeNoPedido: "Caixa personalizada" } // preco null = "sob consulta"
  ]
};
export default CONFIG;
