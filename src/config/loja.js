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
      "O Gatolate nasceu da mistura de duas coisas que amamos: gatinhos e doces! 🍫🐈 Nosso nome carrega esse carinho pelos nossos companheiros de quatro patas e a vontade de compartilhar momentos doces e especiais através dos nossos brownies. Cada detalhe é pensado com muito carinho, desde a preparação até a entrega, para que cada pedacinho leve um pouquinho de amor até vocês."
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
