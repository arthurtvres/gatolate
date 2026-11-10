---
name: orcamento-bundle
description: Mede o tamanho do bundle da loja do Gatolate e confere se o painel e o SDK do Supabase continuam fora do carregamento inicial. Use após adicionar dependência, import novo ou componente grande.
---

# Orçamento do bundle

Referência (10/11/2026): `index-*.js` (85 KB) + chunk compartilhado pré-carregado (`whatsapp-*.js`, 21 KB) = **105,5 KB gzip**. Limite: **110 KB gzip** somando os dois.

1. Rode `npm run build` e leia a coluna gzip.
2. Confira:
   - `index-*.js` + os chunks em `<link rel="modulepreload">` do `dist/index.html` somam no máximo 110 KB gzip
   - `PainelAdmin-*.js`, `AcompanharPedido-*.js` e `Privacidade-*.js` ainda em chunks separados
   - o SDK do Supabase (chunk `dist-*.js`, ~55 KB gzip) ainda separado, sem import estático em `index`
3. Se passou do limite, procure a causa:
   - `grep -rn "@supabase" src`: só `src/lib/supabase.js` pode importar, e com `import()` dinâmico
   - algum arquivo da loja importando de `src/admin/`
   - dependência nova grande: prefira código próprio. Ícones do `lucide-react` são importados por nome.
4. Mostre a tabela de antes e depois. Se o aumento for justificado, proponha atualizar a referência nesta skill.
