# 🐱🍫 Gatolate

Loja online de brownies artesanais com pedido pelo WhatsApp e painel administrativo para a dona do negócio.

O cliente monta o carrinho, preenche os dados de entrega e é levado ao WhatsApp da loja com o pedido já formatado. O pedido também é registrado no banco, e a dona acompanha vendas e faturamento e gerencia o cardápio por um painel próprio.

## Funcionalidades

**Loja**
- Cardápio com busca, modal de detalhes e seletor de quantidade
- Carrinho em gaveta lateral, salvo no navegador e sincronizado entre abas
- Checkout com validação, máscara de telefone, entrega ou retirada e forma de pagamento
- Envio do pedido ao WhatsApp com mensagem pronta e código de identificação
- Layout mobile-first, com botão flutuante de carrinho no celular

**Painel administrativo (`/admin`)**
- Login com e-mail e senha, com acesso restrito a contas autorizadas
- Dashboard: faturamento, vendas, ticket médio, pendentes, faturamento por dia e ranking de produtos, com filtro de período
- Gestão de pedidos: status (pendente → confirmado → entregue/cancelado), ajuste de valor final e busca por código, nome ou telefone
- Aviso de pedido novo em tempo real: som, notificação do navegador, contador no menu e na aba, listas atualizadas sozinhas
- Gestão de produtos: criar, editar, ocultar e excluir, com upload de foto
- Bairros de entrega: adicionar, tirar da lista e definir a taxa de cada um (vazia = a combinar)
- Configurações da loja: textos da página inicial, benefícios do rodapé, formas de pagamento, aviso no topo e pausa de pedidos

## Stack

- **React 19** + **JavaScript**, **Vite**, **React Router**
- **Supabase**: Postgres, autenticação, storage de imagens, Realtime e Row Level Security
- CSS puro organizado por camadas (base, componentes, layout e seções), sem framework de UI
- Gráficos em SVG feitos à mão, sem biblioteca

## Destaques técnicos

- **Preço e taxa calculados no servidor:** o pedido é criado por uma função Postgres (`security definer`) que busca os preços na tabela de produtos e a taxa de entrega na tabela de bairros. Nada que vem do navegador define valores. A pausa de pedidos também é conferida ali.
- **Proteção contra pedidos falsos:** `criar_pedido` limita pedidos por IP (5 a cada 15 min), por telefone (3 a cada 15 min) e da loja inteira (40 por hora), e confere no servidor as mesmas regras do formulário.
- **Row Level Security em todas as tabelas:** visitantes só leem produtos ativos e só criam pedidos pela função. Leitura de pedidos e edição de produtos ficam restritas à tabela `admins`.
- **Performance:** o painel é carregado sob demanda (`React.lazy`) e o SDK do Supabase por import dinâmico. O cliente da loja baixa ~103 KB gzip, e o cardápio aparece na hora a partir de cache local (*stale-while-revalidate*).
- **Registro resiliente:** o pedido é enviado com `fetch keepalive`, então termina mesmo quando o celular troca a página pelo WhatsApp.
- **Acessibilidade:** HTML semântico, foco gerenciado em modal e gaveta (`<dialog>` nativo e foco preso), navegação por teclado nos gráficos, tabela alternativa para cada gráfico e contraste AA.
- **Modo demonstração:** sem as variáveis do Supabase, a loja roda com o cardápio, os textos e os bairros de `src/config/`.
- **Privacidade sem pop-up:** o site não usa cookies de rastreamento; o formulário mostra uma linha "Seus dados estão seguros" com link para `/privacidade`.

## Estrutura

```
src/
├── paginas/Loja.jsx      # loja
├── admin/                # painel (bundle separado)
├── components/           # layout, produtos, carrinho, seções, ui
├── context/ · hooks/     # estado global: produtos, carrinho, toasts
├── services/             # acesso ao Supabase
├── utils/                # lógica pura: cálculos, mensagem, validação
├── config/               # WhatsApp e Instagram (só no código) + textos, pagamentos e bairros padrão
└── styles/
supabase/schema.sql       # tabelas, RLS, função de pedido, storage
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # opcional: URL e publishable key do Supabase
npm run dev
```

Sem o `.env`, o projeto abre em modo demonstração. Para o painel, rode `supabase/schema.sql` no projeto Supabase e cadastre o usuário na tabela `admins`.

## Testes

```bash
npm test            # roda uma vez
npm run test:watch  # roda de novo a cada alteração
```

Os testes (Vitest) cobrem as regras puras: carrinho, validação do formulário, mensagem do WhatsApp, status e valor do pedido e métricas do dashboard. Ficam ao lado de cada arquivo (`*.test.js`).

A cada push e pull request, o GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) roda lint, testes e build.
