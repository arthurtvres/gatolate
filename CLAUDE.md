# Gatolate

Loja de brownies (React 19 + Vite + Supabase). O cliente monta o carrinho e finaliza pelo WhatsApp; o pedido também é gravado no banco. A dona usa o painel em `/admin`.

## Comandos

- `npm run dev`: servidor local
- `npm run lint` · `npm test` · `npm run build`: o mesmo que o CI roda ([.github/workflows/ci.yml](.github/workflows/ci.yml))
- Sem `.env` o site abre em **modo demonstração** (cardápio de `src/config/loja.js`, sem pedidos gravados, sem `/admin`)

## Mapa do código

Detalhe arquivo por arquivo, rotas e banco: [.claude/mapa-projeto.md](.claude/mapa-projeto.md) (gerado por `/mapear-projeto`).

| Pasta | O que tem |
|---|---|
| `src/paginas/` | Telas públicas: `Loja.jsx`, `AcompanharPedido.jsx`, `Privacidade.jsx` |
| `src/admin/` | Painel (carregado com `React.lazy`): `paginas/`, `componentes/`, `hooks/`, `utils/`, `estilos/admin.css` |
| `src/components/<área>/` | Componentes da loja por área: `carrinho`, `produtos`, `pedido`, `layout`, `secoes`, `ui` |
| `src/context/` | Providers: carrinho, produtos, configurações da loja (`ConfigLojaProvider`), toasts. `contextos.js` cria os contextos |
| `src/hooks/` | Hooks da loja (`useCarrinho`, `useProdutos`, `useAcompanhamento`…) |
| `src/services/` | Toda chamada ao Supabase passa por aqui (`pedidosApi`, `produtosApi`, `configApi`, `authApi`, `erros`) |
| `src/lib/supabase.js` | Cliente Supabase com import dinâmico (não entra no bundle inicial) |
| `src/utils/` | Lógica pura e testada: carrinho, validação, mensagem do WhatsApp, status do pedido, formatação |
| `src/config/` | `loja.js`: WhatsApp, Instagram e nome (só mudam no código) + textos, benefícios, pagamentos e produtos **padrão**. `bairros.js`: bairros padrão. Com Supabase, o que a dona edita vem do banco |
| `src/styles/` | CSS puro em camadas: `base/` (tokens em `variaveis.css`), `componentes/`, `layout/`, `secoes/` |
| `supabase/schema.sql` | Banco inteiro: tabelas (incl. `configuracoes` e `bairros`), RLS, `criar_pedido`, limites anti-spam, `acompanhar_pedido`, storage |

## Convenções

- Tudo em português: nomes de arquivos, componentes, funções, variáveis e comentários.
- Componentes em `PascalCase.jsx`, um por arquivo, `export default function`. Comentário curto `/** ... */` dizendo o que o componente faz.
- Sem framework de UI e sem biblioteca de gráficos. Cores, fontes e medidas vêm dos tokens de `variaveis.css`. Mobile-first, com quebras em 560 / 768 / 900 / 1100px.
- Ícones pelo componente `Icone` (sprite em `SpriteIcones.jsx`) ou `lucide-react`.
- Lógica sem React vai para `utils/` com teste `*.test.js` ao lado (Vitest).
- Acessibilidade é requisito: HTML semântico, `<dialog>` nativo e foco preso em modal ou gaveta, navegação por teclado, contraste AA.

## Regras que não podem quebrar

- **Preço e taxa nunca vêm do navegador.** `criar_pedido` (`security definer`) busca os preços em `produtos` e a taxa em `bairros` pelo nome do bairro. O front só manda id, quantidade e bairro.
- **WhatsApp e Instagram não vão para o painel**: ficam em `config/loja.js` para ninguém desviar pedidos se a conta da admin for invadida.
- Textos, pagamentos, bairros e aviso vêm de `useConfigLoja()`. Não leia `CONFIG.textos`/`CONFIG.pagamentos` direto nos componentes.
- **RLS em toda tabela.** Visitante lê produtos ativos e cria pedido só pela função. O resto exige `eh_admin()`.
- **Limites anti-spam** em `conferir_limite_pedidos`: 5 por IP e 3 por telefone a cada 15 min, 40 por hora na loja toda.
- As validações do formulário (`utils/validacao.js`) e as do servidor (`validar_cliente`) precisam continuar iguais.
- O cliente da loja baixa cerca de 105 KB gzip (`index` + chunk pré-carregado). O painel e o SDK do Supabase ficam fora do bundle inicial.
- O pedido é enviado com `fetch keepalive`, porque o celular troca a página pelo WhatsApp logo depois.

## Fluxo de trabalho

- O usuário faz os próprios commits. Ao terminar, entregue só uma mensagem de commit de até 2 linhas; não rode `git commit`.
- Skills do projeto: `/mapear-projeto`, `/verificar`, `/supabase-mudanca`, `/novo-componente`, `/testar`, `/orcamento-bundle`, `/modo-demo`.
- Um hook roda o ESLint em todo arquivo JS que o Claude edita.
