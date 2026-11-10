---
name: supabase-mudanca
description: Checklist obrigatório para qualquer alteração em supabase/schema.sql ou em src/services (tabelas, colunas, policies RLS, funções, storage, realtime). Use sempre que o banco do Gatolate for mexido.
---

# Mudança no Supabase

O `supabase/schema.sql` é o banco inteiro e precisa continuar **idempotente**: rodar o arquivo de novo num projeto que já existe não pode dar erro nem apagar dados.

## Antes de editar
- Leia a parte do `schema.sql` que vai mudar e o service que a usa (`src/services/*Api.js`).
- Diga em uma frase o que muda, para quem (visitante `anon`, admin `authenticated` + `eh_admin()`), e se precisa migrar dados que já existem.

## Ao escrever SQL
- [ ] Use `create table if not exists`, `create or replace function`, `drop policy if exists` antes de `create policy` e `add column if not exists`.
- [ ] Tabela nova: `alter table ... enable row level security` **logo em seguida**, com policies explícitas. Sem policy ninguém acessa, e esse é o padrão certo.
- [ ] Leitura e escrita de admin usam `public.eh_admin()`. Nunca use `using (true)` em tabela com dado de cliente (nome, telefone, endereço).
- [ ] Função `security definer`: precisa de `set search_path = public` (ou vazio, com nomes qualificados), validar toda entrada e ter `revoke all ... from public, anon, authenticated` + `grant execute` só para quem precisa.
- [ ] Preço, total e status nunca vêm do navegador; o servidor calcula. Se mexer em `criar_pedido`, confira que `validar_cliente` e `conferir_limite_pedidos` continuam sendo chamados **antes** do insert.
- [ ] Regra de validação nova no servidor precisa da mesma regra em `src/utils/validacao.js` (com teste), e vice-versa.
- [ ] Realtime: a tabela entra na publicação `supabase_realtime` e o RLS continua filtrando quem recebe os eventos.
- [ ] Storage: só admin escreve no bucket `produtos`.

## Depois
- [ ] Rode `/security-review` se a mudança tocar em pedidos, auth ou RLS.
- [ ] Atualize os "Destaques técnicos" do README se uma regra de segurança mudou.
- [ ] Diga ao usuário **exatamente o que rodar no SQL Editor do Supabase** (o trecho novo ou o arquivo inteiro). O Claude não tem acesso ao banco de produção.
- [ ] Rode `/verificar`.
