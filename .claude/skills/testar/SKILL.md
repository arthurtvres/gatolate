---
name: testar
description: Escreve testes Vitest para a lógica pura do Gatolate (src/utils, src/admin/utils, src/services/erros). Use ao criar ou mudar regra de negócio, ou quando pedirem mais cobertura.
---

# Testar

## O que testar
Só lógica pura, sem React e sem rede. O teste fica ao lado do arquivo, como `pedido.js` → `pedido.test.js`.

Ainda sem teste (confira com `ls`, a lista pode ter mudado): `src/utils/pagamentos.js`, `src/utils/produtos.js`, `src/utils/meusPedidos.js`, `src/utils/armazenamento.js`, `src/admin/utils/avisos.js`, `src/services/erros.js`.

## Como escrever
- Siga o estilo de `src/utils/pedido.test.js`: `import { describe, expect, it } from "vitest"`, um `describe` por assunto e cada `it` com uma frase em português que diz a regra ("cancelado não tem próxima nem anterior").
- Um comportamento por `it`. Cubra os casos de borda: vazio, `null`, preço `null` ("sob consulta"), retirada vs entrega, limites.
- Para `localStorage`, use `vi.stubGlobal` com um objeto falso, sem depender do navegador.
- Datas: `vi.useFakeTimers()` + `vi.setSystemTime(...)`.
- Não mude o código de produção só para facilitar o teste. Se um teste mostrar um bug, avise o usuário antes de corrigir.

Rode `npm test` e depois `/verificar`.
