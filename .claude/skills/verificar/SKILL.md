---
name: verificar
description: Roda lint, testes e build do Gatolate (o mesmo que o CI) e entrega a mensagem de commit. Use antes de dar qualquer tarefa de código por terminada.
---

# Verificar

1. Rode nesta ordem e pare no primeiro que falhar:
   - `npm run lint`
   - `npm test`
   - `npm run build`
2. Se algo falhar, corrija a causa (não desligue regra do ESLint nem pule teste) e rode tudo de novo desde o começo.
3. No build, some o gzip de `dist/assets/index-*.js` com os chunks pré-carregados (`modulepreload` no `dist/index.html`). Se passar de 110 KB, avise e sugira `/orcamento-bundle`.
4. Se a tarefa criou, moveu ou apagou arquivos, rode `node .claude/skills/mapear-projeto/gerar-mapa.mjs` para atualizar o mapa.
5. Termine com:
   - uma linha por etapa (ok / corrigido)
   - a **mensagem de commit em até 2 linhas**, no estilo do repositório (`feat: ...`, `fix: ...`, `refactor: ...`, em inglês como os commits anteriores)
6. Não rode `git commit`. O usuário commita sozinho.
