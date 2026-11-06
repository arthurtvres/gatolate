-- =====================================================================
-- GATOLATE — banco de dados (Supabase / Postgres)
-- ---------------------------------------------------------------------
-- Como usar: no painel do Supabase, abra "SQL Editor", cole este arquivo
-- inteiro e clique em "Run". Pode rodar mais de uma vez sem problema.
--
-- Segurança (RLS):
--   • Visitantes só LEEM produtos ativos e só CRIAM pedidos pela função
--     criar_pedido(), que recalcula os preços no servidor (ninguém
--     consegue inventar valores pelo navegador).
--   • Só quem está na tabela "admins" lê/edita pedidos e produtos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ADMINS
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.admins enable row level security;

-- true se quem está logado é admin
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.eh_admin() to anon, authenticated;

drop policy if exists "admin ve o proprio registro" on public.admins;
create policy "admin ve o proprio registro" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Atualiza a coluna atualizado_em automaticamente
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- PRODUTOS
-- ---------------------------------------------------------------------
create table if not exists public.produtos (
  id             text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  nome           text not null check (length(trim(nome)) between 1 and 80),
  descricao      text not null default '' check (length(descricao) <= 200),
  detalhes       text not null default '' check (length(detalhes) <= 1000),
  informacoes    text[] not null default '{}',
  preco          numeric(10, 2) check (preco is null or preco >= 0), -- null = "Sob consulta"
  unidade        text not null default '' check (length(unidade) <= 40),
  imagem         text not null default '',
  categoria      text not null default '' check (length(categoria) <= 40),
  nome_no_pedido text not null default '' check (length(nome_no_pedido) <= 80),
  ativo          boolean not null default true,
  ordem          integer not null default 0,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
alter table public.produtos enable row level security;

drop trigger if exists produtos_atualizado_em on public.produtos;
create trigger produtos_atualizado_em before update on public.produtos
  for each row execute function public.tocar_atualizado_em();

drop policy if exists "todos veem produtos ativos" on public.produtos;
create policy "todos veem produtos ativos" on public.produtos
  for select to anon, authenticated using (ativo or public.eh_admin());

drop policy if exists "admin cria produtos" on public.produtos;
create policy "admin cria produtos" on public.produtos
  for insert to authenticated with check (public.eh_admin());

drop policy if exists "admin edita produtos" on public.produtos;
create policy "admin edita produtos" on public.produtos
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());

drop policy if exists "admin exclui produtos" on public.produtos;
create policy "admin exclui produtos" on public.produtos
  for delete to authenticated using (public.eh_admin());

-- ---------------------------------------------------------------------
-- PEDIDOS
-- ---------------------------------------------------------------------
create sequence if not exists public.pedidos_codigo_seq;

create table if not exists public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique check (codigo ~ '^[0-9]+$'), -- aparece na mensagem do WhatsApp
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  status           text not null default 'pendente'
                   check (status in ('pendente', 'confirmado', 'entregue', 'cancelado')),
  cliente_nome     text not null,
  cliente_telefone text not null,
  tipo             text not null check (tipo in ('entrega', 'retirada')),
  endereco         text not null default '',
  data_desejada    date,
  periodo          text not null default '',
  observacoes      text not null default '',
  pagamento        text not null default '',
  taxa_entrega     numeric(10, 2) not null default 0,
  subtotal         numeric(10, 2) not null default 0, -- soma dos itens com preço
  tem_sob_consulta boolean not null default false,
  total_final      numeric(10, 2) check (total_final is null or total_final >= 0) -- valor ajustado pela admin
);
-- Migra instalações que ainda tinham códigos aleatórios.
alter table public.pedidos drop constraint if exists pedidos_codigo_check;
do $$
declare
  v_max integer;
begin
  select coalesce(max(codigo::integer), 0) into v_max
    from public.pedidos
   where codigo ~ '^[0-9]+$';

  update public.pedidos p
     set codigo = lpad((v_max + antigos.ordem)::text, 4, '0')
    from (
      select id, row_number() over (order by criado_em, id) as ordem
        from public.pedidos
       where codigo !~ '^[0-9]+$'
    ) antigos
   where p.id = antigos.id;

  alter table public.pedidos
    add constraint pedidos_codigo_check check (codigo ~ '^[0-9]+$');
end;
$$;
select setval(
  'public.pedidos_codigo_seq',
  coalesce((select max(codigo::integer) from public.pedidos), 1),
  (select count(*) > 0 from public.pedidos)
);
create index if not exists pedidos_criado_em_idx on public.pedidos (criado_em desc);
alter table public.pedidos enable row level security;

drop trigger if exists pedidos_atualizado_em on public.pedidos;
create trigger pedidos_atualizado_em before update on public.pedidos
  for each row execute function public.tocar_atualizado_em();

create table if not exists public.pedido_itens (
  id             bigint generated always as identity primary key,
  pedido_id      uuid not null references public.pedidos (id) on delete cascade,
  produto_id     text,          -- sem FK: o histórico continua mesmo se o produto for excluído
  nome           text not null,
  quantidade     integer not null check (quantidade between 1 and 99),
  preco_unitario numeric(10, 2), -- null = sob consulta
  subtotal       numeric(10, 2)
);
create index if not exists pedido_itens_pedido_idx on public.pedido_itens (pedido_id);
alter table public.pedido_itens enable row level security;

-- Pedidos e itens: só admin lê, edita e exclui. Ninguém insere direto (só pela função abaixo).
drop policy if exists "admin ve pedidos" on public.pedidos;
create policy "admin ve pedidos" on public.pedidos
  for select to authenticated using (public.eh_admin());
drop policy if exists "admin edita pedidos" on public.pedidos;
create policy "admin edita pedidos" on public.pedidos
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());
drop policy if exists "admin exclui pedidos" on public.pedidos;
create policy "admin exclui pedidos" on public.pedidos
  for delete to authenticated using (public.eh_admin());

drop policy if exists "admin ve itens" on public.pedido_itens;
create policy "admin ve itens" on public.pedido_itens
  for select to authenticated using (public.eh_admin());

-- ---------------------------------------------------------------------
-- criar_pedido: chamada pela loja ao enviar o pedido para o WhatsApp.
-- Preços e nomes vêm da tabela produtos, nunca do navegador.
-- ---------------------------------------------------------------------
create or replace function public.criar_pedido(
  p_codigo  text,
  p_cliente jsonb,
  p_itens   jsonb,
  p_taxa    numeric default 0
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id uuid;
  v_item      jsonb;
  v_produto   public.produtos%rowtype;
  v_qtd       integer;
  v_subtotal  numeric := 0;
  v_sob       boolean := false;
  v_tipo      text := coalesce(p_cliente ->> 'tipo', '');
begin
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) not between 1 and 50 then
    raise exception 'Itens inválidos';
  end if;
  if v_tipo not in ('entrega', 'retirada') then
    raise exception 'Tipo de entrega inválido';
  end if;
  if length(trim(coalesce(p_cliente ->> 'nome', ''))) < 2 then
    raise exception 'Nome inválido';
  end if;

  insert into public.pedidos (
    codigo, cliente_nome, cliente_telefone, tipo, endereco,
    data_desejada, periodo, observacoes, pagamento, taxa_entrega
  ) values (
    lpad(nextval('public.pedidos_codigo_seq')::text, 4, '0'),
    left(trim(p_cliente ->> 'nome'), 100),
    left(trim(coalesce(p_cliente ->> 'telefone', '')), 30),
    v_tipo,
    case when v_tipo = 'entrega' then left(trim(coalesce(p_cliente ->> 'endereco', '')), 300) else '' end,
    nullif(p_cliente ->> 'data', '')::date,
    left(coalesce(p_cliente ->> 'periodo', ''), 30),
    left(coalesce(p_cliente ->> 'observacoes', ''), 500),
    left(coalesce(p_cliente ->> 'pagamento', ''), 40),
    case when v_tipo = 'entrega' then least(greatest(coalesce(p_taxa, 0), 0), 500) else 0 end
  )
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item ->> 'quantidade')::integer;
    if v_qtd is null or v_qtd not between 1 and 99 then
      raise exception 'Quantidade inválida';
    end if;

    select * into v_produto from public.produtos where id = v_item ->> 'produto_id' and ativo;
    if not found then
      raise exception 'Produto indisponível: %', v_item ->> 'produto_id';
    end if;

    insert into public.pedido_itens (pedido_id, produto_id, nome, quantidade, preco_unitario, subtotal)
    values (
      v_pedido_id,
      v_produto.id,
      coalesce(nullif(v_produto.nome_no_pedido, ''), v_produto.nome),
      v_qtd,
      v_produto.preco,
      v_produto.preco * v_qtd
    );

    if v_produto.preco is null then
      v_sob := true;
    else
      v_subtotal := v_subtotal + v_produto.preco * v_qtd;
    end if;
  end loop;

  update public.pedidos
     set subtotal = v_subtotal, tem_sob_consulta = v_sob
   where id = v_pedido_id;

  select codigo into p_codigo from public.pedidos where id = v_pedido_id;
  return p_codigo;
end;
$$;
grant execute on function public.criar_pedido(text, jsonb, jsonb, numeric) to anon, authenticated;

-- ---------------------------------------------------------------------
-- ACESSO PELA API
-- Concede explicitamente o que o site usa, para funcionar mesmo com
-- "expor tabelas novas automaticamente" desligado no projeto.
-- Quem vê/edita cada linha continua sendo decidido pelo RLS acima.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.produtos to anon, authenticated;
grant insert, update, delete on public.produtos to authenticated;
grant select, update, delete on public.pedidos to authenticated;
grant select on public.pedido_itens to authenticated;
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------
-- FOTOS DOS PRODUTOS (Storage)
-- Leitura pública pelo link; só admin envia, troca ou apaga.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

drop policy if exists "admin envia fotos" on storage.objects;
create policy "admin envia fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and public.eh_admin());
drop policy if exists "admin troca fotos" on storage.objects;
create policy "admin troca fotos" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and public.eh_admin());
drop policy if exists "admin apaga fotos" on storage.objects;
create policy "admin apaga fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and public.eh_admin());

-- ---------------------------------------------------------------------
-- PRODUTOS INICIAIS (só entram se ainda não existirem)
-- ---------------------------------------------------------------------
insert into public.produtos (id, nome, descricao, preco, unidade, imagem, categoria, nome_no_pedido, ordem) values
  ('tradicional', 'Tradicional', 'Brownie clássico com casquinha',       8.00,  'unidade', 'produtos/tradicional.jpg', 'brownies', '',                    1),
  ('recheado',    'Recheados',   'Recheio cremoso de brigadeiro',        10.00, 'unidade', 'produtos/recheado.jpg',    'brownies', '',                    2),
  ('especial',    'Especiais',   'Cobertura de chocolate branco e Oreo', 12.00, 'unidade', 'produtos/especial.jpg',    'brownies', '',                    3),
  ('caixa',       'Pedidos',     'Caixas personalizadas',                null,  '',        'produtos/caixa.jpg',       'caixas',   'Caixa personalizada', 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- TORNAR UM USUÁRIO ADMIN
-- 1) Authentication → Users → "Add user" (e-mail + senha, marque "Auto Confirm").
-- 2) Rode a linha abaixo trocando o e-mail:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'dona@gatolate.com.br'
--    on conflict do nothing;
-- ---------------------------------------------------------------------
