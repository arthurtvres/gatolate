const CONFIG = {
  whatsapp: "559991356768",
  nomeLoja: "Gatolate",
  taxaEntrega: 0,
  instagram: "https://instagram.com/gaatolate",
  instagramUsuario: "@gaatolate",
  textos: {
    subtituloProdutos: "Feitos com muito amor e ingredientes selecionados",
    momentoLinha1: "É mais que um brownie...",
    momentoLinha2: "É um momento especial!",
    proposito: "Transformar momentos simples em doces memórias!",
    sobre: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
      // "A Gatolate nasceu na cozinha de casa, entre uma fornada e outra, com a ajuda (nem sempre útil) da nossa gatinha, que vive rondando o forno.",
      // "Cada brownie é feito à mão, em pequenas quantidades, com chocolate de qualidade e aquela casquinha crocante que a gente ama. Fazemos também caixas personalizadas para presentes, festas e datas especiais."
    ],

    // Mensagem que já vem escrita quando o cliente clica em "Falar no WhatsApp".
    saudacaoContato: "Olá, Gatolate! Vim pelo site e queria tirar uma dúvida 🐱"
  },

  /* Benefícios mostrados no rodapé (a última parte do site).*/
  beneficios: [
    { icone: "qualidade", titulo: "Qualidade em cada mordida" },
    { icone: "entrega",   titulo: "Entrega rápida e segura" },
    { icone: "protegida", titulo: "Compra protegida" },
    { icone: "pagamento", titulo: "Diversas formas de pagamento" }
  ],

  /* FORMAS DE PAGAMENTO*/
  pagamentos:
  [
    { nome: "Pix" },
    { nome: "Dinheiro" },
    { nome: "Cartão"}
  ],

  /* PRODUTOS */
  produtos: [
    { id: "tradicional", nome: "Tradicional", descricao: "Brownie clássico com casquinha", preco: 8.00, unidade: "unidade", imagem: "produtos/tradicional.jpg", categoria: "brownies" },
    { id: "recheado", nome: "Recheados", descricao: "Recheio cremoso de brigadeiro", preco: 10.00, unidade: "unidade", imagem: "produtos/recheado.jpg", categoria: "brownies" },
    { id: "especial", nome: "Especiais", descricao: "Cobertura de chocolate branco e Oreo", preco: 12.00, unidade: "unidade", imagem: "produtos/especial.jpg", categoria: "brownies" },
    { id: "caixa", nome: "Pedidos", descricao: "Caixas personalizadas", preco: null, unidade: "", imagem: "produtos/caixa.jpg", categoria: "caixas", nomeNoPedido: "Caixa personalizada" } // preco null = "sob consulta"
  ]
};
export default CONFIG;
