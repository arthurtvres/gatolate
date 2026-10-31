# 🐱🍫 Gatolate — site de brownies

Site de vendas da Gatolate. O cliente escolhe os brownies, preenche os dados e é levado ao **WhatsApp da loja** com o pedido já escrito. O pagamento (Pix, dinheiro ou cartão) é combinado pelo WhatsApp. Não tem checkout nem pagamento online.

A dona da loja tem um **painel em `/admin`** com:
- **Dashboard:** faturamento, vendas, ticket médio, pedidos pendentes, faturamento por dia e produtos mais vendidos.
- **Pedidos:** todos os pedidos feitos pelo site; dá para confirmar, marcar como entregue ou cancelar e ajustar o valor final.
- **Produtos:** criar, editar, ocultar e excluir produtos, com envio de foto.

Feito em **React + JavaScript** ([Vite](https://vite.dev)), com banco de dados e login no **[Supabase](https://supabase.com)** (plano grátis).

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) (versão LTS) instalado.

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:5173 e atualiza sozinho ao salvar
```

| Comando | O que faz |
|---|---|
| `npm run build` | Gera o site pronto para publicar na pasta `dist/` |
| `npm run preview` | Mostra a versão do `dist/` no navegador |
| `npm run lint` | Procura erros no código |

> **Modo demonstração:** sem o Supabase configurado, a loja funciona normalmente com os produtos do `src/config/loja.js`, mas os pedidos não são registrados e o `/admin` mostra como configurar.

---

## 1. Configurar o Supabase (banco + login) — uma vez só

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (plano Free). Guarde a senha do banco que ele pedir.
2. No projeto, abra **SQL Editor → New query**, cole **todo** o arquivo [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria as tabelas, as regras de segurança, o espaço para as fotos e os 4 produtos iniciais. (Pode rodar de novo sem problema.)
3. Em **Project Settings → API Keys**, copie a **Publishable key** (começa com `sb_publishable_`). A URL é `https://<código-do-projeto>.supabase.co` (o código aparece na URL do painel). **Nunca** use a *Secret key*.
4. Na pasta do projeto, copie o arquivo `.env.example` para `.env` e cole os dois valores:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   O `.env` não vai para o GitHub (está no `.gitignore`). A chave *publishable* pode ficar no site: quem protege os dados são as regras de segurança do banco.
5. **Crie o login da dona:** em **Authentication → Users → Add user**, informe e-mail e senha e marque **Auto Confirm User**. Depois, no **SQL Editor**, rode (trocando o e-mail):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'dona@gatolate.com.br'
   on conflict do nothing;
   ```
6. **Bloqueie cadastros novos:** em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**. Assim só quem você criar consegue entrar.
7. Rode `npm run dev`, abra `http://localhost:5173/admin` e entre com o e-mail e a senha.

### Segurança (o que o banco garante)
- Visitantes só **leem produtos visíveis** e só **criam pedidos** por uma função que **recalcula os preços no servidor**: ninguém consegue mudar valores pelo navegador.
- Pedidos, edição de produtos e envio de fotos: **só para quem está na tabela `admins`**. Um login comum, sem estar nessa tabela, não vê nada.

---

## 2. Usando o painel (`/admin`)

**Como uma venda é contada:** todo pedido enviado pelo site chega como **Pendente**, porque ele só é fechado no WhatsApp. Depois de combinar com o cliente, abra o pedido no painel e mude para **Confirmado** (ou **Entregue** quando entregar, ou **Cancelado** se não fechar). **Só pedidos confirmados e entregues entram no faturamento.**

- Cada pedido tem um **código** (ex.: `#K7M2QX`) que aparece também na mensagem do WhatsApp. Use a busca do painel para achar o pedido certo.
- **Valor final:** para itens *sob consulta*, descontos ou taxa de entrega combinada, digite o valor fechado no campo "Valor final". Em branco, vale a soma automática.
- **Produtos:** "Ocultar" tira o produto da loja sem apagar (bom para itens que acabaram). "Excluir" apaga de vez, mas os pedidos antigos continuam no histórico.
- As mudanças nos produtos aparecem para os clientes na próxima vez que eles abrirem o site.

---

## 3. Textos, WhatsApp e pagamentos

Abra `src/config/loja.js`:

- `whatsapp`: número que recebe os pedidos, no formato **55 + DDD + número**, só dígitos. Exemplo: **(21) 98765-4321** → `"5521987654321"`.
- `taxaEntrega`: valor da entrega em reais (`7.00`). Deixe `0` para "a combinar".
- `instagram` e `instagramUsuario`: link e @ do Instagram.
- `regiaoEntrega`: texto sobre onde vocês entregam.
- `textos`: frases do site e o texto da seção "Sobre nós".
- `pagamentos`: formas de pagamento (aparecem no rodapé e no formulário).

> Os **produtos** são editados no painel `/admin`. A lista `produtos` do `loja.js` só é usada no modo demonstração.

**Logo e ícone da aba:** substitua `public/logo.png` por outro arquivo com o mesmo nome.

---

## 4. Publicar grátis

As variáveis do Supabase também precisam ser configuradas na hospedagem.

### Vercel (recomendada)
1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com): **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (os mesmos valores do `.env`).
4. Clique em **Deploy**. O `vercel.json` já faz a rota `/admin` funcionar.

### Netlify
- **Com GitHub:** **Add new site → Import from Git**. Em **Site configuration → Environment variables**, adicione as duas variáveis. O `netlify.toml` já tem o comando de build.
- **Arrastando:** com o `.env` preenchido, rode `npm run build` e arraste **a pasta `dist/`** para [app.netlify.com/drop](https://app.netlify.com/drop).

O arquivo `public/_redirects` garante que a rota `/admin` abra na Netlify.

### Depois de publicar
- **Supabase → Authentication → URL Configuration:** coloque o endereço do site (ex.: `https://gatolate.vercel.app`) em **Site URL**.
- **Preview no WhatsApp:** no `index.html`, troque o `og:image` pelo endereço completo, ex.: `https://gatolate.vercel.app/logo.png`.

---

## Estrutura

```
gaatolate/
├── index.html                  → página base (título, meta tags, fontes)
├── .env.example                → modelo das chaves do Supabase (copie para .env)
├── supabase/schema.sql         → banco: tabelas, segurança, função de pedido, fotos
├── public/                     → logo, fotos padrão (produtos/) e _redirects
└── src/
    ├── config/loja.js          → ✏️ WhatsApp, textos, pagamentos (e produtos do modo demo)
    ├── main.jsx · App.jsx      → ponto de partida e rotas ("/" loja · "/admin" painel)
    ├── paginas/Loja.jsx        → a loja (ordem das seções)
    ├── components/             → peças da loja: layout/, produtos/, secoes/, carrinho/, ui/
    ├── admin/                  → painel (carregado só em /admin)
    │   ├── paginas/            → Login, Dashboard, Pedidos, Produtos
    │   ├── componentes/        → gráficos, filtros, formulário de produto...
    │   ├── hooks/ · utils/     → sessão, carregamento de dados, cálculos do dashboard
    │   └── estilos/admin.css
    ├── context/ · hooks/       → estado global: produtos, carrinho, avisos
    ├── services/               → conversa com o Supabase (produtos, pedidos, login)
    ├── lib/supabase.js         → cliente do Supabase (carregado sob demanda)
    ├── utils/                  → funções puras (cálculos, mensagem do WhatsApp, validação)
    ├── assets/icones.svg       → todos os ícones desenhados
    └── styles/                 → CSS da loja: base/, componentes/, layout/, secoes/
```

## Como funciona o pedido
1. O cliente adiciona brownies ao carrinho, que fica salvo no navegador.
2. Em **Finalizar pedido**, preenche nome, telefone, entrega ou retirada, data e forma de pagamento.
3. Ao enviar, o pedido é **registrado no painel** e o WhatsApp abre com a mensagem pronta:

```
Olá, Gatolate! 🐱🍫
Gostaria de fazer um pedido:

🧾 Pedido #K7M2QX

2x Tradicional — R$ 16,00
1x Especiais — R$ 12,00
1x Caixa personalizada — sob consulta

💰 Total: R$ 28,00 (+ itens sob consulta)

👤 Nome: Maria Silva
📱 Telefone: (11) 98888-7777
🚚 Entrega: Rua X, 123 – Bairro Y
📅 Para: 02/11, à tarde
💳 Pagamento: Pix
```

4. O cliente aperta "enviar", vocês combinam o pagamento e a dona marca o pedido como **Confirmado** no painel.
