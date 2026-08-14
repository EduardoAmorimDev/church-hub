# Lote 2 do Lamb (molecules, `count` do NavItem, `avatarGroup` da Cell) - Verificação

**Verdict**: PASS - 102/102 checks provados. Os achados 1, 2 e 5 da rodada 1 foram corrigidos e confirmados; 3 e 4 seguem abertos por decisão (reportados ao usuário).
**Profile**: `light` (o `AGENTS.md` não declara perfil). Rodaram os passos 2, 3 e 5 do `verify.md`. O passo 1 (comparação com as fontes binding), o recálculo do `Coverage`, os veredictos de `Test policy` e a injeção de falhas são de `standard`/`ui` e **não rodaram**; o checklist não tem seção `Test policy`.
**Diff range**: `4bedcdf` (HEAD) + working tree sem commit (`git diff 4bedcdf` + 56 arquivos sem rastreio em `packages/ui`)
**Round**: 2 - scoped (rodada 1 - full, no mesmo working tree antes da correção)
**Verifier**: sub-agente independente (author != verifier), somente leitura no código

## Rodada 2 - escopo e resultado (verified at working tree sobre `4bedcdf`, 2026-10-09)

Arquivos tocados pela correção, segundo o autor e conferidos na leitura:
- `molecules/DatePicker/DatePicker.types.ts`
- `molecules/MenuDropdown/MenuDropdown.tsx`
- `atoms/Radio/Radio.tsx`
- `atoms/AvatarGroup/AvatarGroup.tsx`
- `AvatarGroup.spec.tsx`, `Breadcrumb.spec.tsx`, `AvatarContent.spec.tsx` e o bloco C97 de `Cell.spec.tsx`
- os textos da task e do checklist

- **Provas, re-executadas por completo:** uma invocação Jest com as 19 specs (`scratchpad/verify-mol-r2.json`): 19 suítes, **443/443** testes passaram. As 105 linhas `Proof:` do checklist atual (101 checks com prova Jest; C42, C44, C87 e C96 têm duas) casam com pelo menos um teste que passou. Nenhum padrão ficou com 0 hits, e em todos o número de hits é igual ao de aprovados.
- **Gate (C102), re-executado:** `npm run verify -- --force` com exit 0. Foram 10/10 tarefas, `Cached: 0`, 40 suítes e 782 testes.
- **Achado 1 (XIII), resolvido:**
  - `DatePicker.types.ts:23` `/** invariant: called on Esc inside the grid; the picker never closes itself. */`
  - `DatePicker.types.ts:25` `/** invariant: names the calendar \`role="group"\`; defaults to "Calendário". */`
  - `MenuDropdown.tsx:47` `/** invariant: names the \`role="menu"\`; without it the menu is unnamed. */`
  - `Radio.tsx:134` `/** invariant: rendered under the label and linked by \`aria-describedby\`. */`
  - O mesmo grep de blocos de comentário sobre todos os arquivos novos e alterados só acha comentários que já existiam em `4bedcdf`, fora do diff: `Cell.tsx:15,19`, `Cell.types.ts:32,52,60`, `Cell.spec.tsx:7` e `Toggle.tsx:151`.
- **Achado 2 (nesting), resolvido:**
  - `AvatarGroup.tsx:22-25` usa `ComponentProps<'div'>`.
  - `AvatarGroup.tsx:49-53` tem raiz `<div … role="img">`, e os `Avatar` (`<div>`) e o "+N" (`<span>`) são filhos de um `<div>`.
  - Na Cell, o contêiner também é `<div>`.
  - C1–C5 e C97 continuam verdes.
- **Achado 5 (fixtures), resolvido nos arquivos tocados:**
  - `AvatarGroup.spec.tsx:7-11` usa 'Pessoa A'…'Pessoa E', e C1 espera `'PA','PB','PC'` (`:25-29`).
  - `Breadcrumb.spec.tsx:11` e `AvatarContent.spec.tsx:15` usam 'Pessoa Exemplo'.
  - O bloco C97 da Cell usa 'Pessoa A'…'Pessoa D' (`Cell.spec.tsx:336-339`).
  - Resta "Ana Beatriz" em `Cell.spec.tsx:24` e seguintes, mas são testes do lote 1, fora do diff.
- **Achados 3 e 4:** `carried from round 1`, sem mudança, porque os arquivos que eles citam (FilterChip, RadioGroup, ListItem e figma-links specs) não foram tocados.
- **Citações atualizadas:** C1, C2, C7, C12, C62, C63 e C97 (ver tabela). As linhas de Breadcrumb e AvatarContent não se moveram; só os valores mudaram.
- **Outras seções:** `carried from round 1`. Isso vale para as linhas de check em arquivos não tocados e para Swept/Observable e Regras transversais. O nome das props não mudou: o AvatarGroup só troca o elemento base, e `people`/`max`/`size`/`label` continuam iguais.

## Binding sources

O passo 1 não roda no perfil `light`. Artefato Lamb e Figma não foram abertos para comparação. Abri só a regra `.lamb-radio[data-variant="card"]` da cópia local do `bundle.css`, para conferir um ponto do C37 (ver C37). Não é um passo 1.

## Como as provas rodaram

- Uma única invocação Jest com as 19 specs da feature, mais `--json --outputFile=<scratchpad>/verify-mol.json`: **19 suítes, 443 testes, 443 passaram**.
- Para cada `-t` do checklist, conferi no JSON que pelo menos um teste cujo `fullName` casa com a regex rodou e passou. As 101 provas `-t` casam, nenhuma com 0 hits (contagens na tabela). O C43 roda o arquivo inteiro (12 testes passaram). O C99 (`"story design links"`, sem id) casa 22 testes, entre eles os 5 novos: Breadcrumb, Alert, StatCard, AvatarContent e MenuDropdown, todos `passed`.
- Todo teste citado está no diff: é arquivo novo ou bloco adicionado sobre `4bedcdf`. As exceções são o C43 (spec do lote 1 com a asserção de densidade alterada) e o C99 (o teste parametrizado já existia; as 5 linhas de `NODES` são novas, `figma-links.spec.ts:51-55`).

Legenda de caminhos (relativos a `packages/ui/src/`): `AG`=`components/atoms/AvatarGroup/AvatarGroup.spec.tsx`, `AV`=`components/atoms/Avatar/Avatar.spec.tsx`, `BC`=`components/molecules/Breadcrumb/Breadcrumb.spec.tsx`, `FC`=`components/molecules/FilterChip/FilterChip.spec.tsx`, `AL`=`components/molecules/Alert/Alert.spec.tsx`, `RG`=`components/molecules/RadioGroup/RadioGroup.spec.tsx`, `RA`=`components/atoms/Radio/Radio.spec.tsx`, `TG`=`components/atoms/Toggle/Toggle.spec.tsx`, `ST`=`styles.spec.ts`, `ES`=`components/molecules/EmptyState/EmptyState.spec.tsx`, `SC`=`components/molecules/StatCard/StatCard.spec.tsx`, `AC`=`components/molecules/AvatarContent/AvatarContent.spec.tsx`, `LI`=`components/molecules/ListItem/ListItem.spec.tsx`, `MD`=`components/molecules/MenuDropdown/MenuDropdown.spec.tsx`, `DP`=`components/molecules/DatePicker/DatePicker.spec.tsx`, `NI`=`components/atoms/NavItem/NavItem.spec.tsx`, `NV`=`components/molecules/Navigation/Navigation.spec.tsx`, `CE`=`components/atoms/Cell/Cell.spec.tsx`, `FL`=`figma-links.spec.ts`.

Conversões conferidas: unidade Tailwind de 4px; `rounded-lg` 8, `rounded-xl` 12, `rounded-2xl` 16, `rounded-10` 10; `text-size-25` 12/16, `-50` 14/16, `-75` 16/24, `-200` 20/28, `-300` 24/28, `-500` 36/40; `leading-5` 20px, `leading-7.5` 30px. Nomes novos no `@theme` (`styles.css`): `ring-surface`, `grid-cols-fill-50`, `grid-cols-fill-30`, `text-icon-32`, `text-icon-48`.

## Checks

Citações de AG, BC, AC e CE: verified at round 2. As demais: carried from round 1 (arquivos não tocados), com as provas re-executadas e verdes na rodada 2.

| Check | Claim | Proof run (hits/passed) | Evidence file:line + assertion | Result |
|---|---|---|---|---|
| C1 | 5 pessoas, max 3: 3 small + "+2", img com 5 nomes, filhos ocultos | 1/1 | `AG:19-20` `getByRole('img',{name:'Pessoa A, Pessoa B, Pessoa C, Pessoa D, Pessoa E'})`; `AG:25-29` iniciais `['PA','PB','PC']`; `AG:24` `toHaveLength(4)`; `AG:31-32` `aria-hidden 'true'` + `size-8`; `AG:34` `/^\+2$/`; `AG:36` um único img mesmo com `hidden:true` | PASS |
| C2 | `label` nomeia o grupo | 1/1 | `AG:43` `getByRole('img',{name:'12 participantes'})` | PASS |
| C3 | sobreposição 8/10/14/16/24 + anel 2px surface | 5/5 | `AG:48-52` `-ml-2`/`-ml-2.5`/`-ml-3.5`/`-ml-4`/`-ml-6` por tamanho; `AG:59` `toHaveClass(box, overlap, 'ring-2', 'ring-surface')` | PASS |
| C4 | `length <= max` sem "+N" | 1/1 | `AG:66-67` 3 filhos + `queryByText(/^\+/)` ausente; `AG:70-71` com `max=5` | PASS |
| C5 | `people=[]` não renderiza (Unresolved 2, assumido) | 1/1 | `AG:77` `toBeEmptyDOMElement()` | PASS (default assumido, ver achado 4) |
| C6 | Avatar `decorative` | 2/2 | `AV:121-124` sem `role`/`aria-label`, `aria-hidden 'true'`, texto `PF`; `AV:139` `<img>` presente | PASS |
| C7 | nav + ol de 3, dois links, atual `span aria-current` | 1/1 | `BC:20` nome "Trilha de navegação"; `BC:24-26` NAV/OL/3; `BC:27-35` hrefs e 2 links; `BC:37-40` "Pessoa Exemplo" é SPAN, `aria-current 'page'`, sem `<a>` (r2: valor atualizado, mesma linha) | PASS |
| C8 | "/" `aria-hidden` entre itens, nenhum após o último | 1/1 | `BC:49-53` 2 separadores "/", 1/1/0 por item | PASS |
| C9 | 500 14/16, gap 8, secundário/primário, hover | 1/1 | `BC:64` `text-size-50 font-medium gap-2`; `BC:66` `gap-2 text-secondary`; `BC:68-72` `hover:text-primary hover:underline`; `BC:73` `text-primary` | PASS |
| C10 | item sem href é texto; onClick uma vez | 1/1 | `BC:96-99` SPAN, sem `<a>`, 1 link; `BC:102` `toHaveBeenCalledTimes(1)` | PASS |
| C11 | `label` customiza o nav | 1/1 | `BC:109-113` nome "Caminho", o padrão ausente | PASS |
| C12 | um item só = atual, sem separador (Unresolved 3, assumido) | 1/1 | `BC:120-126` 1 item, sem link, `aria-current 'page'`, 0 separadores | PASS (default assumido, ver achado 4) |
| C13 | removível 32px, borda 999, raio 8, bg-hover, 500 14/16; ✕ 32px chama 1x | 1/1 | `FC:19-27` `h-8 border border-neutral-999 rounded-lg bg-hover text-size-50 font-medium`; `FC:28-32` "Rede:" 400 secundário, "Jovens" 600; `FC:33` `w-8`; `FC:38` `toHaveBeenCalledTimes(1)` | PASS |
| C14 | corpo-botão "Editar filtro…"; sem onClick é texto | 1/1 | `FC:52-58` nome + 1 chamada; `FC:61-62` 1 botão, "Jovens" fora de botão | PASS |
| C15 | hover `bg-selected`; ✕ pressionado `neutral-alpha/40` | 1/1 | `FC:78` e `FC:79-82` `not-disabled:hover:bg-selected`, `not-disabled:active:bg-neutral-alpha/40` | PASS |
| C16 | 6px acima/abaixo | 1/1 | `FC:95` `h-8`; `FC:99-104` `after:absolute after:inset-x-0 after:-inset-y-1.5` em cada botão | PASS |
| C17 | disabled: border-default, transparente, text-disabled, sem callback | 1/1 | `FC:125-130` `border-default bg-transparent text-disabled`; `FC:131` "Rede:" `text-disabled`; `FC:133-139` os dois `toBeDisabled` e nenhuma chamada | PASS (precisão, achado 3a) |
| C18 | toggle = Chip `aria-pressed`, `check`/`iconName`, onClick | 1/1 | `FC:150` `aria-pressed 'false'`; `FC:152` glifo `group`; `FC:155` 1 chamada; `FC:160-161` `true` + `check` | PASS (precisão, achado 3b) |
| C19 | `variant` explícito vence | 1/1 | `FC:172-173` removable sem onRemove; `FC:183-186` toggle com onRemove, sem ✕ | PASS |
| C20 | success: fundo, borda, ícone 20 preenchido, título 600 14/20, p12 g12 r10 ≤448 | 1/1 | `AL:19-28` `bg-positive-subtle border-green-alpha/40 p-3 gap-3 rounded-10 w-full max-w-112`; `AL:29-31` `check_circle`, `text-icon-20!`, `'FILL' 1`; `AL:32-37` `text-size-50 leading-5 font-semibold text-positive` | PASS |
| C21 | info/error/warning conforme a tabela | 3/3 | `AL:41-55` (fundo, borda, ícone, cor) idênticos à tabela do critério 19; `AL:62-65` | PASS |
| C22 | prefixo oculto | 4/4 | `AL:70-73` as 4 palavras; `AL:78-81` `sr-only`, texto exato, primeiro filho do título | PASS |
| C23 | children 400 14/20 primário, gap 4 | 1/1 | `AL:90-96` `text-size-50 leading-5 font-normal text-primary`; pai `flex-col gap-1` | PASS |
| C24 | actions em linha gap 8, 12 abaixo do texto | 1/1 | `AL:115-116` `flex gap-2`; pai `flex-col gap-3` | PASS |
| C25 | ✕ 32×32 "Fechar aviso"/`closeLabel`, ícone 20, chama; sem onClose sem botão | 1/1 | `AL:128-134` `size-8`, `close`, `text-icon-20!`, 1 chamada; `AL:143` "Dispensar"; `AL:146` sem botão | PASS |
| C26 | live: `alert` no error, `status` nos demais; sem live sem role | 1/1 | `AL:153`, `AL:159`, `AL:163` | PASS |
| C27 | `iconName` substitui | 1/1 | `AL:169-170` `campaign`, sem `check_circle` | PASS |
| C28 | fieldset radiogroup + legend 500 16/24, mb 4; `legendHidden` | 1/1 | `RG:37-45` FIELDSET, `aria-labelledby`=legend.id, `text-size-75 font-medium text-primary mb-1`; `RG:49-52` nome mantido + `sr-only` | PASS |
| C29 | herdam name/size/disabled; marcado = valor do grupo | 1/1 | `RG:61-65` `name 'tipo'`, desabilitado, `size-7`, "Voltou" marcado; `RG:73-79` nome gerado único, `size-4` | PASS |
| C30 | defaultValue + clique → `onChange('primeira', event)`; controlado | 1/1 | `RG:93-97` 1 chamada com `('primeira', objectContaining({target}))`; `RG:119-127` só muda pelo pai | PASS |
| C31 | seta para baixo marca e foca a próxima habilitada | 1/1 | `RG:145-147` pula a desabilitada, foco + marcada | PASS |
| C32 | helperText 400 14/20 secundário, em `aria-describedby` | 1/1 | `RG:155-167` classes, `aria-describedby`, descrição acessível, logo após a legend | PASS |
| C33 | error: ícone `error`, `text-danger`, `aria-invalid`, describedby, `red-67` | 1/1 | `RG:182-194` | PASS |
| C34 | " *" `aria-hidden` + `aria-required`; `optional` | 1/1 | `RG:202-206`; `RG:209-211` | PASS |
| C35 | horizontal: linha, quebra, 24px entre colunas | 1/1 | `RG:217-222` `flex flex-row flex-wrap gap-x-6` | PASS |
| C36 | card p16, borda 1px default, r12, surface, 8px, descrição 20 | 1/1 | `RG:230-236` `p-4 border border-default rounded-xl bg-surface`; `RG:238` `gap-2`; `RG:239-241` `leading-5` | PASS |
| C37 | marcado 999 + 1px interno; hover bg-hover + neutral-33; pressionado selected | 1/1 | `RG:251-255` `border-neutral-999 inset-ring inset-ring-neutral-999`; `RG:259` `hover:bg-hover active:bg-selected`; `RG:261-262` `hover:border-neutral-33` só no cartão não marcado. Batem com o `bundle.css`: a regra `[data-checked="true"]` vem depois da `:hover`, com a mesma especificidade, então a borda 999 vence | PASS |
| C38 | anel 2px offset 2 no cartão, não no círculo | 1/1 | `RG:272-277` `has-focus-visible:outline-2 …offset-2 …outline-focus-ring` + `focus-visible:outline-none` no círculo | PASS |
| C39 | card error `red-67`; card disabled bg-hover, border-default, sem interna | 1/1 | `RG:291`; `RG:303-309` | PASS |
| C40 | card + horizontal: colunas ≥ 200px | 1/1 | `RG:319` `grid grid-cols-fill-50 gap-2`; `RG:321-323` `--grid-template-columns-fill-50: … calc(var(--spacing) * 50) …` | PASS (nível, achado 3c) |
| C41 | disabled no grupo | 1/1 | `RG:331-333` | PASS |
| C42 | Painel 12px sem min/padding; App gap 0, min 44, padding 10 (6 no large); card 8 | ST 5/5 + RG 1/1 | CSS compilado: `ST:322-330` esperados literais `[44,0]`, `[10,0]`, `[6,0]`, `[0,12]` escritos à parte das tabelas; `ST:305` `appPx`, `ST:309` `(width >= 60rem)`, `ST:310` `:not(:where([data-viewport="mobile"]) *)`, `ST:313` `[data-viewport="desktop"]`; `ST:533` card `8`. jsdom: `RG:345-363` as mesmas classes nas linhas reais, `RG:367-372` card sem densidade | PASS |
| C43 | Radio solto mantém name/checked/size; lote 1 verde | arquivo 12/12 | `RA:22` linha com as classes só de App; `RA:32` `toBeChecked()`; `RA:39-65` tamanhos; `RA:155+` "single choice by name (C30)" | PASS |
| C44 | Toggle min 44 só no App; trilho 44 sempre | ST 4/4 + TG 3/3 | `ST:540` `[44, 0]`; `ST:544-552` `after:h-11`/`w-11`/`w-13` = 44/44/52px, sem media e sem `data-viewport`; `TG:211` `after:h-11`; `TG:215` classes de App | PASS |
| C45 | coluna centralizada, g16, 32×16; círculo 80; `inbox` 48 contorno 300; h3 600 16/24 | 1/1 | `ES:22-30` `gap-4 py-8 px-4`; `ES:32-42` `size-20 bg-hover text-secondary`, `text-icon-48!`, `'FILL' 0`, `'wght' 300`; `ES:17-18`+`ES:43` h3 `text-size-75 font-semibold` | PASS |
| C46 | description 400 16/24 secundário, gap 4, ≤ 420 | 1/1 | `ES:57-62` `text-size-75 font-normal text-secondary`, `gap-1 max-w-105` | PASS |
| C47 | headingLevel 2–6 | 5/5 | `ES:68-73` | PASS |
| C48 | success: `task_alt` preenchido, positivo, sem actions | 1/1 | `ES:86-89` | PASS |
| C49 | error: `error` preenchido, danger, `role="status"` | 1/1 | `ES:102-105` | PASS |
| C50 | actions centralizadas, com quebra, gap 8 | 1/1 | `ES:124` `flex flex-wrap justify-center gap-2` | PASS |
| C51 | page: min 360, centro vertical, 48×24 | 1/1 | `ES:133` `min-h-90 justify-center py-12 px-6` | PASS |
| C52 | small: g12, 24×16, círculo 56, ícone 32, descrição 14/20 | 1/1 | `ES:147-155` `gap-3 py-6 px-4`, `size-14`, `text-icon-32!`, `text-size-50 leading-5` | PASS |
| C53 | compact: linha, g12, 12×16, 32/20, gap 2, 500 14/20, 400 12/16, nowrap | 1/1 | `ES:170-187` | PASS |
| C54 | `iconName` / `illustration` | 1/1 | `ES:199`; `ES:208-209` | PASS |
| C55 | article labelledby, p24 g24 r16, surface, sem sombra; rótulo 400 14/16; "1.284" Oswald 700 36/40 | 1/1 | `SC:18-35` `aria-labelledby`=label.id, `p-6 gap-6 rounded-2xl bg-surface`, sem `shadow-`, `font-oswald font-bold text-size-500 uppercase tabular-nums text-primary` | PASS |
| C56 | ícone antes do rótulo, 16, gap 8 | 1/1 | `SC:43-46` | PASS |
| C57 | `Intl` pt-BR "R$ 2.115,00"; string como veio | 1/1 | `SC:59-60` literal `'R$ 2.115,00'` + texto renderizado; `SC:63` "—" | PASS |
| C58 | trend 500 12/16 positivo, ml 8, sem caixa alta | 1/1 | `SC:73-81` | PASS |
| C59 | help: botão 24 redondo, `info` 16, nome, Tooltip hover/foco | 1/1 | `SC:93-114` | PASS |
| C60 | subs: linha, quebra, g12; ícone 14, valor 500 12/16, rótulo 400, gap 4 | 1/1 | `SC:132-144` | PASS |
| C61 | small: p/g 12, valor 24/30 | 1/1 | `SC:150-155` `p-3 gap-3`, `text-size-300 leading-7.5` | PASS |
| C62 | section aria-label, p24 g18 r16, surface, borda; cabeçalho g16, Avatar large decorativo, h3 600 20/28 | 1/1 | `AC:15`+`AC:29` nome "Pessoa Exemplo" (r2); `AC:28-43` `p-6 gap-4.5 rounded-2xl bg-surface border border-default`, `gap-4`, `size-14`, `aria-hidden`, sem img, `text-size-200 font-semibold` | PASS |
| C63 | description 400 14/20 secundário; badges com quebra, g8, mt 4 | 1/1 | `AC:66-74` | PASS |
| C64 | `<dl>` colunas ≥ 120, g12; dt 500 12/16; dd 500 14/20, mt 2 | 1/1 | `AC:91-95` `grid-cols-fill-30 gap-3` + texto do tema `* 30`; `AC:108-118` | PASS (nível, achado 3c) |
| C65 | headingLevel 2/3/4 | 3/3 | `AC:121-126` | PASS |
| C66 | li > div min 64, 8×16, g12; 500 16/24 e 400 14/16 truncados, g2; sem chevron | 1/1 | `LI:34-48` | PASS |
| C67 | leading secundário ícone 24; trailing 400 14/16, g8 | 1/1 | `LI:64-79` | PASS |
| C68 | `<a href>` inteiro, chevron 20, pointer, r8, hover/pressed | 1/1 | `LI:91-103` | PASS |
| C69 | `<button type="button">`, 1 chamada | 1/1 | `LI:116-126` | PASS |
| C70 | foco 2px offset -2 | 1/1 | `LI:139-144` `focus-visible:outline-2 …outline-focus-ring …-outline-offset-2` | PASS |
| C71 | compact min 48 + 14/20; comfortable min 72 | 1/1 | `LI:156-168` `min-h-12`, `text-size-50 leading-5`, `min-h-18` | PASS |
| C72 | divisor 1px default de 16px, exceto no último; `divider={false}` | 1/1 | `LI:177-187` `not-last:after:left-4 … border-b border-default`; `LI:194-196` | PASS (nível, achado 3d) |
| C73 | selected: `aria-current="true"` + bg-selected | 1/1 | `LI:207-208` | PASS |
| C74 | disabled+href: sem href, aria-disabled, sem navegação/onClick, text-disabled; disabled+onClick | 1/1 | `LI:231-240`; `LI:249-251` | PASS |
| C75 | `as="label"` alterna Checkbox, sem chevron | 1/1 | `LI:275-284` | PASS |
| C76 | `chevron` decide; `action` fora, pr 8 | 1/1 | `LI:312-319`; `LI:326` | PASS |
| C77 | fechado: haspopup, expanded false, controls, sem menu | 1/1 | `MD:37-40` | PASS |
| C78 | menu 4px abaixo, start/end, min 180, p8, r16, surface, sombra, borda; foco no 1º | 1/1 | `MD:51-69` `top-full mt-1 left-0 min-w-45 p-2 rounded-2xl bg-surface shadow-elevation-low-bottom-12 border border-default`, `id`=`aria-controls`, foco em "Editar"; `MD:74-75` `right-0` | PASS |
| C79 | item menuitem tabindex -1, min 36, 8×12, g8, r8, 500 14/16, ícone 20, estados | 1/1 | `MD:87-106` | PASS |
| C80 | destructive `text-danger`; disabled `text-disabled`, pulado, sem onSelect | 1/1 | `MD:117-127` | PASS |
| C81 | setas com volta | 1/1 | `MD:135-145` | PASS |
| C82 | clique/Enter/Espaço fecham + onSelect 1x | 1/1 | `MD:155-167` contagens 1, 2 e 3 | PASS |
| C83 | Esc fecha e devolve o foco; Tab; clique fora | 1/1 | `MD:176-187` | PASS |
| C84 | todos disabled: foco no menu, Esc fecha (Unresolved 4, assumido) | 1/1 | `MD:205-214` | PASS (default assumido, ver achado 4) |
| C85 | cabeçalho, grid "outubro de 2026" `aria-live`, dom…sáb com `abbr`, 4 vazias | 1/1 | `DP:63-113` | PASS |
| C86 | nome "…, hoje"; 600, contorno 1px 999, ponto 4px | 1/1 | `DP:118-131` `font-semibold inset-ring inset-ring-neutral-999 after:size-1 after:rounded-full` | PASS |
| C87 | dia redondo 400 14/16 tabular; 40 Painel / 44 App compilado; hover/pressed | DP 1/1 + ST 2/2 | `DP:142-152`; `ST:563` `expectAutoDensity(…, [44, 40])` para width e height | PASS |
| C88 | single: `onChange('2026-10-15')`; selecionado + `aria-selected` | 1/1 | `DP:163-181` | PASS |
| C89 | um tabulável; ←→↑↓ Home End PgUp/PgDn Shift; Enter/Espaço; Esc | 1/1 | `DP:189-247` (as 10 teclas, troca de grade, `onCancel` 1x) | PASS |
| C90 | min/max: aria-disabled, riscado, motivos no nome, sem onChange, botões de mês | 1/1 | `DP:259-286` | PASS |
| C91 | disabledDates: motivo no nome + Tooltip; `true` → "Data indisponível" | 1/1 | `DP:304-322` | PASS |
| C92 | range 10→6 normalizado; faixa contínua com pontas; prévia no hover | 1/1 | `DP:331-375` | PASS |
| C93 | atalhos sob borda 1px, g8; selecionam e mostram o mês; desabilitados se bloqueados | 1/1 | `DP:393-414` | PASS |
| C94 | selects trocam a grade; anos decrescentes por yearRange / min–max / −100…+5 | 1/1 | `DP:451-470` (2031…1926, 106 anos) | PASS |
| C95 | ISO inválido = ausente (Unresolved 5, assumido) | 1/1 | `DP:478-499` | PASS (default assumido, ver achado 4) |
| C96 | count 3: CountBadge "3 novos" após rótulo `flex-1`; 0/ausente/collapsed sem badge; Navigation repassa | NI 1/1 + NV 1/1 | `NI:262-277`; `NV:33-39` | PASS |
| C97 | Cell avatarGroup: AvatarGroup xSmall, todos os nomes | 1/1 | `Cell.spec.tsx:345` nome "Pessoa A, Pessoa B, Pessoa C, Pessoa D"; `:350` `size-6`; `:351` `/^\+1$/`; `:352` `h-12 p-2` (r2: linhas atualizadas) | PASS |
| C98 | 11 exports resolvem; `ISODate`/`DateRange` exportados | 12/12 | `FL:140` `expect(exported[nameOf(entry)]).toBeDefined()` para os 11; tipos: `FL:124-127` compilados pelo `typecheck` do C102 | PASS (precisão, achado 3e) |
| C99 | 5 stories apontam para os nós | 5/5 dos novos (22 no padrão) | `FL:51-55` ids; `FL:210-212` `startsWith(nodeUrl(id))` + `node-id=…` | PASS |
| C100 | spec, story e linha no doc; linha "Not built yet" removida | 12/12 | `FL:165-171` arquivos, `title`, linha do doc; `FL:180-181` | PASS |
| C101 | ícones 32 e 48 nos tokens + utilitário compilado | 2/2 | `ST:573` `icon.size[px]` = px; `ST:575` `font-size` resolvido para `32px`/`48px` | PASS |
| C102 | gate completo sem cache | `npm run verify -- --force` exit 0 | Tasks 10/10, `Cached: 0`, 40 suítes, 782 testes passaram | PASS |

### Swept / Observable "existing"

- `Swept` do checklist: nenhuma linha resolve para *existing*.
- Observable da task, "MenuDropdown · ordem = existing (ordem do array `items`)": confirmado, porque `MD:135-145` percorre o foco na ordem do array.
- Observable da task, "`figma-components.md` · estrutura = existing (tabela Components)": confirmado, as 11 linhas novas estão na tabela (`packages/docs/figma-components.md:46-56`, mais a linha do Radio em `:43`).

### Regras transversais

- **Props existentes renomeadas**: nenhuma. Avatar ganha `decorative`, NavItem `count` e Cell a variante `avatarGroup`. O Radio troca `VariantProps<typeof radio>` por `size?: RadioSize` explícito e mantém `size`/`disabled`. O Toggle não muda a API.
- **Valores arbitrários / `style` inline**: nenhum de cor, tamanho ou espaçamento no código novo. Aparecem `data-[active=true]:` (variante, não valor), `[&_.material-symbols-outlined]:` (seletor, precedente do SearchField) e `transition-[background-color,border-color]` (`Radio.tsx` card, mesmo padrão que o Toggle já tinha). O lint passa.
- **Defaults assumidos (Unresolved 2–5)**: C5, C12, C84 e C95 implementam exatamente o "Until answered" da task (`AvatarGroup.tsx:42` `return null`, entre outros). Ver achado 4.

## Gate

Rodada 2: `npm run verify -- --force` - Tasks 10 successful / 10, Cached 0, `@church/ui:test` 40 suítes e 782 testes passaram, exit 0. Rodada 1: idêntico. O `console.error` "Not implemented: window.scrollTo" vem do `motion` no `NavItem.spec.tsx` e já existia em `4bedcdf`.

## Achados (por ordem de gravidade)

1. ~~**Princípio XIII: três comentários sem prefixo**~~ - **resolvido na rodada 2** (`DatePicker.types.ts:23,25`, `MenuDropdown.tsx:47` e também `Radio.tsx:134`, todos com `invariant:`).
2. ~~**Nesting HTML inválido no AvatarGroup**~~ - **resolvido na rodada 2** (`AvatarGroup.tsx:22-25,49-53`: a raiz é `<div role="img">`).
3. **Gaps de precisão e de nível** (carried from round 1, inalterado; o usuário foi informado. Não derrubam o check, mas a asserção é mais fraca que a afirmação):
   - a. C17: "valor `text-disabled`" só é afirmado no contêiner e em "Rede:" (`FC:125-132`); "Jovens" não tem asserção direta, só herda a cor.
   - b. C18: "é um `Chip`" é provado pelas classes `h-8 border-default` (`FC:151`), não pela identidade do componente. Outra implementação com as mesmas classes também passaria.
   - c. C40/C64: a largura mínima de 200/120px é conferida no **texto-fonte** de `styles.css` (`RG:321-323`, `AC:93-95`), e o valor esperado é a própria declaração da implementação. Não há prova em CSS compilado como a do C42. O `* 50`/`* 30` está legível no ponto da asserção, mas a string esperada é uma cópia da implementação.
   - d. C72: "exceto no último" só é provado pela presença do prefixo `not-last:` num único item (`LI:187`). O jsdom não avalia a pseudo-classe, então isso é limite do nível de teste.
   - e. C98: a exportação dos **tipos** `ISODate`/`DateRange` é provada só pelo `typecheck` do C102 (`FL:124-127`). A asserção de runtime `FL:149` `expect(SAMPLE_DAY).toMatch(/^\d{4}-\d{2}-\d{2}$/)` testa um literal e passaria com qualquer implementação.
   - f. C99: o padrão `-t "story design links"` não tem id e casa também os 17 testes do lote 1. Os 5 nós novos foram conferidos um a um no JSON.
4. **Defaults assumidos aguardando o usuário** (carried from round 1, inalterado; Unresolved 2–5 da task continuam `open`): C5 (`people=[]` → `null`), C12 (um item = página atual), C84 (foco no menu) e C95 (ISO inválido = ausente) estão implementados e provados como o "Until answered" manda. Se o usuário decidir outra coisa, quatro checks e o código mudam. O Unresolved 1 (nó do AvatarGroup) deixa a story sem `parameters.design`, como previsto.
5. ~~**Fixtures com nome de pessoa plausível**~~ - **resolvido na rodada 2** nos arquivos do diff (`AG:7-11`, `BC:11`, `AC:15`, `Cell.spec.tsx:336-339`). Fica "Ana Beatriz" nos testes do lote 1 da Cell (`Cell.spec.tsx:24` e seguintes), que estão fora do diff.

Fora do perfil `light`, e portanto **não verificado**: a comparação dos checks com o artefato Lamb e o Figma (passo 1, incluindo a composição de cada componente), o recálculo do `Coverage` e a injeção de falhas.
