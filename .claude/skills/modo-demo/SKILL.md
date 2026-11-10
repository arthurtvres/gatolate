---
name: modo-demo
description: Confere se o Gatolate continua funcionando sem as variáveis do Supabase (modo demonstração). Use após mexer em services, providers, lib/supabase.js ou em qualquer feature que dependa do banco.
---

# Modo demonstração

Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o site precisa:
- mostrar o cardápio de `src/config/loja.js`
- deixar montar o carrinho e abrir o WhatsApp com a mensagem pronta
- **não** quebrar nem mostrar erro técnico ao enviar o pedido (ele só não é gravado)
- mostrar o aviso de configuração (`AvisoConfiguracao`) em `/admin`, sem tela branca
- não tentar conexão realtime nem notificação

## Como conferir
1. Todo código novo que usa o banco precisa checar `supabaseConfigurado` (de `src/lib/supabase.js`) ou tratar a rejeição de `obterSupabase()`. Leia o diff procurando chamadas sem essa proteção.
2. Rode sem as chaves. Variável de ambiente vazia tem prioridade sobre o `.env`, então **não mexa no `.env`**:
   - build: `VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite build --outDir "$TEMP/gato-demo"`
   - app: `VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npm run dev`
3. Se der, use `/run` para abrir a loja nesse modo e fazer um pedido de ponta a ponta, e abra `/admin`.
4. Apague `$TEMP/gato-demo` e informe o resultado.
