---
name: mapear-projeto
description: Gera e atualiza o mapa detalhado do Gatolate (.claude/mapa-projeto.md), com cada arquivo de src/, o que faz, o que exporta, se tem teste, as rotas e as tabelas/funções do banco. Use para se localizar no código antes de uma tarefa grande, ou depois de criar, mover ou apagar arquivos.
---

# Mapear o projeto

O mapa sai do próprio código, não de memória. A descrição de cada arquivo vem do comentário do topo (ou do `/** */` acima do `export default`). Por isso, manter esses comentários em dia é o que deixa o mapa bom.

## Para se localizar
1. Se `.claude/mapa-projeto.md` não existir ou for mais antigo que a última mudança de estrutura, gere de novo (passo abaixo).
2. Leia só as seções que interessam à tarefa (rotas, banco ou a pasta em questão) antes de abrir os arquivos.

## Para atualizar
1. Rode `node .claude/skills/mapear-projeto/gerar-mapa.mjs` na raiz do projeto.
2. O script lista os arquivos **sem comentário de topo**. Para os que você criou ou mexeu nesta tarefa, escreva um `/** ... */` de uma linha acima do `export default` (o que é, não como funciona) e rode de novo.
3. Compare com a tabela "Mapa do código" do `CLAUDE.md`: se surgiu uma pasta nova ou mudou o papel de uma pasta, atualize essa tabela também. O `CLAUDE.md` fica com a visão geral; o mapa, com o detalhe.
4. Confira no topo do mapa a contagem "utils/services testados". Se caiu, sugira `/testar`.

## Não faça
- Não edite `.claude/mapa-projeto.md` à mão: ele é sobrescrito a cada execução.
- Não ponha regras ou decisões no mapa. Isso vai no `CLAUDE.md` ou na skill do assunto.
