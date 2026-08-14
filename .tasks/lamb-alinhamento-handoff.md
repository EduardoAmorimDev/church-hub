# Handoff: alinhamento do `@church/ui` ao Lamb

Atualizado em 2026-10-08. Ponto de partida para a próxima sessão.

## Estado

- **Implementação:** concluída. O Verifier independente deu **PASS em 45/45**.
- **Gate:** `npm run verify` verde também sem cache (10/10 tarefas, 20 suítes, 497 testes).
- **Commit:** nenhum. Tudo está no working tree de `main` sobre `5b8f934`: 73 modificados, 18 novos
  e 2 removidos. Os commits ficam com o usuário, que trabalha direto em `main`.
- **Perfil da verificação:** `light`. Não comparou o checklist com o design tela a tela nem injetou
  falhas. Subir para `ui` é decisão do usuário.

## Arquivos de referência

| Arquivo | Conteúdo |
| --- | --- |
| `.tasks/lamb-alinhamento.md` | Task: 44 critérios, Decided, Out of scope, Unresolved |
| `.tasks/lamb-notas-para-o-designer.md` | 30 inconsistências internas do artefato e a precedência aplicada |
| `.checks/lamb-alinhamento.md` | Checklist C1–C45 com as provas; Landing e Handoff dos lotes A, B e C |
| `.checks/lamb-alinhamento.verified.md` | Relatório do Verifier |

Fonte do design: o artefato "Lamb" (https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb), atualizado
pelo designer em 2026-10-05. A cópia local da sessão anterior ficou no scratchpad, que não
persiste. Se precisar dela, releia com a ação `read` da ferramenta Artifact.

## Decisões do usuário (não reabrir)

- **Escopo:** só os 19 componentes que já existiam. Os 28 componentes novos do Lamb (Alert, Dialog,
  Drawer, Select, SideMenu, Page, Stack…) viram tasks próprias.
- **API:** nomes e literais de props existentes ficam intocados ("props que parecem ter sido feitas
  por conta de convenção não devem ser tocadas"). O design manda em visual, estados, padrões, a11y
  e comportamento. Props novas entram com o nome do Lamb e os literais da convenção.
- **IconButton** fica (o `Button iconOnly` do Lamb foi rejeitado).
- **Padrão do Button:** fica o atual, `filled` + `neutral` + `medium`.
- **Paginator:** o campo de salto continua aparecendo a partir de 6 páginas, com validação, e a
  troca de tamanho continua voltando à página 1.
- **Toast `info`:** `bg-action-primary` + `text-inverse`.

## O que foi feito

- **Tokens** (`packages/tokens`): `semantic.ts`, `shadow.ts` e os ícones 14/18/26. O `root.css`
  publica `--semantic-light-*`, `--semantic-dark-*`, `--brand-*` e `--elevation-*`.
- **`packages/ui/src/styles.css`:**
  - utilitários `text-*`, `bg-*`, `border-*` com os nomes do Lamb, via `--text-color-*`,
    `--background-color-*` e `--border-color-*`;
  - `shadow-elevation-*`;
  - anel de foco global em `:focus-visible` (2px, offset 2);
  - `prefers-reduced-motion`;
  - `cursor: not-allowed` em `disabled`.
- **Fonte:** Noto Sans → Inter em `apps/web/app/layout.tsx` e `.storybook/decorators.tsx`.
- **Componentes:** Button, IconButton, Badge, Tag, Avatar, Icon, Tooltip, Typography, Checkbox,
  Field, TextField, TextArea, SearchField, NavItem, Navigation, Cell, Table, Paginator e Toast
  seguem os valores e a a11y do Lamb.
  - Base de campo nova em `utils/fieldControl.ts` e `FieldHelperText`; saíram `neutralFieldColor` e
    `fieldRingStyles`.
  - Checkbox virou `<input type="checkbox">` nativo.
  - Props novas:
    - Button: `color="accent"`;
    - Icon: `label`;
    - Tooltip: `size`;
    - NavItem: `selected`;
    - SearchField: `onSearch`/`onClear`;
    - Cell: `icon` e `type="avatar"`;
    - Table: `density`, `captionHidden`, `onSortChange` e `align` na coluna;
    - Paginator: `label`;
    - Typography: `p0`.
- **Specs novas:** `styles.spec.ts` (compila o CSS real com Tailwind), `figma-links.spec.ts`,
  IconButton, Badge, Tooltip, Typography, Field, TextField, TextArea e NavItem.
- **`turbo.json`:** `test` depende de `^build`.
- **Docs:** `packages/docs/figma-components.md` com os 14 nós do Figma, os tokens semânticos e o
  mapa de raios.

## Pendências para o usuário

1. **Helper do Checkbox:** ainda em `neutral-67`/`red-67`/`green-67` (3,2:1). Recomendado
   `text-secondary`/`text-danger`/`text-positive`. Exige critério novo.
2. **Aceitar ou reverter duas mudanças de tipo em API pública:** o `slotProps.helperText` dos campos
   passou de `<span>` para `<p>`, e o `label` da `Cell` de cabeçalho passou de `string` para
   `ReactNode`. As duas foram registradas em Landing depois do código.
3. **Teste de foco do Checkbox:** `Checkbox.spec.tsx:106-117` deixou de afirmar o anel e agora só
   afirma que o outline não é suprimido. O anel em si é provado em `styles.spec.ts`. Devolver a
   asserção positiva?
4. **Commit** das mudanças (o usuário faz).

## Lacunas menores (registradas, não bloqueiam)

- O contador do TextArea mostra "3/10" e anuncia "3/10 caracteres" no leitor de tela. O critério
  dizia "N caracteres".
- Erro e sucesso de campo são provados só no TextField. A caixa do salto do Paginator só tem o
  tamanho afirmado.
- Cores semânticas afirmadas pela primitiva equivalente: Avatar `neutral-17`; campo e Checkbox
  `red-67`/`green-83`.
- Avatar, Icon e Tooltip sem nó do Figma. Os 14 nós nunca foram abertos para confirmar que existem
  no arquivo `7I9GnO3cTPpaJPOUfFsI9t`.
- Seletor arbitrário `[&_input::-webkit-search-cancel-button]` no SearchField; o lint não pega.
- Linhas da Table continuam com `bg-neutral-00`. O Paginator com `pageSize` inválido mostra "0
  itens".
- `NavItem.spec` imprime um `console.error` de `window.scrollTo` no Jest, sem falhar.

## Próximos passos possíveis

- Resolver as pendências 1–3 e commitar.
- Levar `.tasks/lamb-notas-para-o-designer.md` ao designer.
- Planejar os componentes novos do Lamb com `/tlc-plan`, um grupo por task. Sugestão de ordem pelas
  dependências: Stack, Divider, Chip e CountBadge → Alert, Select, Radio, Toggle → Drawer, Dialog,
  SideMenu, Page.
