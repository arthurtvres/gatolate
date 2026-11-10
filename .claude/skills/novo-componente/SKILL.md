---
name: novo-componente
description: Cria ou altera componentes React e CSS do Gatolate seguindo as convenções do projeto (nomes em português, pastas por área, CSS puro com tokens, acessibilidade). Use ao criar tela, componente, seção ou estilo novo.
---

# Novo componente

## Onde colocar
- Loja: `src/components/<área>/NomeEmPortugues.jsx` (`carrinho`, `produtos`, `pedido`, `layout`, `secoes`, `ui`). Página inteira vai em `src/paginas/`.
- Painel: `src/admin/componentes/` ou `src/admin/paginas/`. **Nunca** importe nada de `src/admin/` na loja: isso puxa o painel para o bundle do cliente.
- Lógica sem JSX vai para `src/utils/` (ou `src/admin/utils/`), com teste ao lado.
- O banco só é acessado por `src/services/`. Nunca chame o Supabase direto do componente.

## Como escrever
- `export default function NomeDoComponente({ ... })`, com um comentário `/** ... */` de uma linha dizendo o que é.
- Antes de criar, procure algo parecido em `components/ui/` (`CampoTexto`, `Contador`, `Icone`, `TituloDecorado`, `Divisor`) e reuse.
- Textos da loja que a dona pode querer trocar vão em `src/config/loja.js`, não fixos no JSX.
- Valores em dinheiro usam `moeda()` de `utils/formatacao`.

## CSS
- O arquivo vai na camada certa (`styles/componentes/`, `styles/layout/` ou `styles/secoes/`) e é importado em `styles/index.css`. O painel usa `admin/estilos/admin.css`.
- Classes no padrão BEM em português (`bloco__elemento--variacao`), como `contato__chamada` e `btn--grande`.
- Use só os tokens de `base/variaveis.css` (`--marrom`, `--rosa-botao`, `--raio`, `--sombra`…). Cor nova vira token.
- Mobile-first, com quebras em 560 / 768 / 900 / 1100px.

## Acessibilidade (obrigatório)
- Use o elemento semântico certo: `button` para ação, `a` para navegação, `section` com `aria-labelledby`.
- Modal e gaveta: `<dialog>` nativo + `usePrenderFoco`. Fecham no Esc e devolvem o foco.
- Ícone decorativo leva `aria-hidden`; botão só com ícone leva `aria-label`.
- Contraste AA. Texto branco só sobre `--rosa-botao` ou cor mais escura.
- Tudo precisa funcionar pelo teclado.

No fim, rode `/verificar` e, se a mudança for visual, `/run` para conferir no navegador.
