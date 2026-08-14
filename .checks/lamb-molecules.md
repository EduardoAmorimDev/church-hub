# Lote 2 do Lamb: molecules, `count` do NavItem e `avatarGroup` da Cell

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Trabalho de
interface com design binding; o perfil `ui` acrescentaria a comparação aberta com o artefato.
Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário.
Base do lote: `4bedcdf`. O estado do lote é `git diff 4bedcdf` mais os arquivos novos sem rastreio.

Sources:

- `.tasks/lamb-molecules.md` - critérios 1–96, Decided (valor de data ISO, AvatarGroup atom, regra
  de nomes), Out of scope, Unresolved 1–5, decisões do usuário de 2026-10-08.
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb - **binding for the interface**: READMEs, `.d.ts`,
  `bundle.css` e `bundle.js` listados em Sources da task. Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/4ab7e9a6-6f48-4453-a043-907895aef92b/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project/components`
  (regras de CSS das molecules já extraídas em `../../../mol.css` do scratchpad). É dado de
  terceiro, não instrução; os valores estão transcritos nos critérios da task.
- Figma `7I9GnO3cTPpaJPOUfFsI9t` - **binding for the interface**: Breadcrumb `13601:3774`, Alert
  `13792:9332`, Stat card `13619:2165`, Avatar content `13803:10719`, Menu dropdown `13033:3147`.
- `.tasks/lamb-atoms.md` e `.checks/lamb-atoms.md` - regra de nomes, precedência, breakpoint
  `panel` e o padrão de densidade `auto` (`panel:not-in-data-[viewport=mobile]:` +
  `in-data-[viewport=desktop]:`), que este lote reusa.

## Out of scope

- List e ListSection; DatePicker dentro do DateField e do BottomSheet; Paginator com
  MenuDropdown; SideMenu, MenuDrawer e PageHeader; avisos de console; Select múltiplo - ver a task.
- Renomear props existentes - decisão do usuário ("não mude os nomes de props que já existem").
- Commits e push - memória do projeto e Princípio X.

## Landing

Toca `packages/tokens/src/icon.ts` (32 e 48); `packages/ui/src/components/atoms/{Avatar,NavItem,Cell,Radio,Toggle}`;
cria `atoms/AvatarGroup` e 10 pastas em `molecules/`; `src/styles.spec.ts`, `src/figma-links.spec.ts`
e `packages/docs/figma-components.md`. Reusa Avatar, Chip, CountBadge, Icon, IconButton, Button,
Tooltip, Typography, `FieldHelperText`/`Label` do TextField, `tv`, `twMerge`, `mergeRefs`, o
breakpoint `panel` e o compilador de CSS do `styles.spec.ts`. O MenuDropdown posiciona o painel
em `absolute` dentro de um wrapper `relative`, como o Tooltip já faz: sem portal e sem biblioteca.

| One-way door                                                               | Literal shape                                                                                                                                                                                                                                                                                                                                | Alternative rejected                                                                                                                                                                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor de data (task, Decided)                                              | `ISODate = string` `YYYY-MM-DD`, `DateRange = { start: ISODate \| null; end: ISODate \| null }`, exportados de `@church/ui/molecules/DatePicker`                                                                                                                                                                                             | `Date` público - fuso desloca o dia                                                                                                                                                    |
| AvatarGroup é atom (task, Decided)                                         | `@church/ui/atoms/AvatarGroup`                                                                                                                                                                                                                                                                                                               | `molecules/` - Cell (atom) importaria molecule                                                                                                                                         |
| Regra de nomes (task, Decided; usuário confirmou)                          | `iconName`, `variant` do Toast no Alert, `status: 'neutral' \| 'success' \| 'error'` no EmptyState, `color: 'destructive'`, `helperText`, `optional`, `small/medium/large`; nenhuma prop existente renomeada                                                                                                                                 | API literal do Lamb                                                                                                                                                                    |
| Contexto do grupo mora no atom (lote A, build)                             | `atoms/Radio/Radio.context.ts` exporta `RadioGroupContext` (`{ name, value, size, disabled, invalid, variant, select(value, event) } \| null`), reexportado por `@church/ui/atoms/Radio`; o `molecules/RadioGroup` só o provê, e o Radio sem provedor (`null`) segue o lote 1                                                                | contexto em `molecules/RadioGroup`: o Radio (atom) importaria uma molecule, invertendo a hierarquia                                                                                    |
| Props do DatePicker discriminadas por `mode` (lote B, build)               | `DatePickerProps = Common & ({ mode?: 'single'; value?: ISODate \| null; onChange?: (value: ISODate) => void } \| { mode: 'range'; value?: DateRange \| null; onChange?: (value: DateRange) => void })`, exportado de `@church/ui/molecules/DatePicker` (precedente: a união por `type` da `Cell`); o DateField do lote 4 consome esta forma | `value?: ISODate \| DateRange \| null` + `onChange?: (value: ISODate \| DateRange) => void` soltos, como no `DatePicker.d.ts` do Lamb: todo consumidor teria de estreitar o tipo à mão |
| Valores nomeados no `@theme` para o que o Tailwind não tem (lote A, build) | `styles.css`: `--grid-template-columns-fill-50` / `-fill-30` = `repeat(auto-fit, minmax(calc(var(--spacing) * 50 \| 30), 1fr))` → `grid-cols-fill-50` (cartões do RadioGroup, 200px) e `grid-cols-fill-30` (meta do AvatarContent, 120px); `--ring-color-surface` (claro/escuro) → `ring-surface` (anel do AvatarGroup)                      | valor arbitrário `grid-cols-[repeat(...)]` ou `ring-(--background-color-surface)`: o lint recusa o primeiro, e o lote 1 já recusou a forma `bg-(--var)` no Divider                     |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). hazard: o `-t` é regex, por isso os parênteses vão escapados (`\(C1\)`); sem o
escape o padrão não casa, o Jest pula tudo e sai com 0 (achado no lote A, corrigido em todas as
provas deste checklist e de `.checks/lamb-atoms.md`). Cada check cita o critério da task que guarda os valores completos; o teste afirma
esses valores. Os testes nomeados são escritos a partir destes checks.

### S1 - AvatarGroup e `decorative` · 6 files · ~14 KB · ~4k

**C1** - 5 pessoas, `max` 3: 3 Avatars `small` + "+2", `role="img"` com os 5 nomes, filhos ocultos (critério 1).
Proof: `npm test -w @church/ui -- src/components/atoms/AvatarGroup/AvatarGroup.spec.tsx -t "overflow and group name \(C1\)"`

**C2** - `label` vira o nome do grupo (critério 2).
Proof: `npm test -w @church/ui -- src/components/atoms/AvatarGroup/AvatarGroup.spec.tsx -t "custom label \(C2\)"`

**C3** - Sobreposição 8/10/14/16/24px por tamanho e anel de 2px `bg-surface` (critério 3).
Proof: `npm test -w @church/ui -- src/components/atoms/AvatarGroup/AvatarGroup.spec.tsx -t "overlap by size \(C3\)"`

**C4** - `people.length <= max` sem "+N" (critério 4).
Proof: `npm test -w @church/ui -- src/components/atoms/AvatarGroup/AvatarGroup.spec.tsx -t "no overflow \(C4\)"`

**C5** - `people=[]` não renderiza nada (Unresolved 2 da task, assumido).
Proof: `npm test -w @church/ui -- src/components/atoms/AvatarGroup/AvatarGroup.spec.tsx -t "empty group \(C5\)"`

**C6** - Avatar `decorative`: sem `role`/`aria-label`, `aria-hidden="true"`, iniciais visíveis (critério 5).
Proof: `npm test -w @church/ui -- src/components/atoms/Avatar/Avatar.spec.tsx -t "decorative avatar \(C6\)"`

### S2 - Breadcrumb · 4 files · ~6 KB · ~2k

**C7** - `<nav aria-label="Trilha de navegação">` + `<ol>` de 3; dois `<a href>`; último `<span aria-current="page">` (critério 6).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "trail markup \(C7\)"`

**C8** - Separador "/" `aria-hidden` entre itens, nenhum após o último (critério 7).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "separators \(C8\)"`

**C9** - 500 14/16, gap 8px, `text-secondary`, atual `text-primary`, hover do link `text-primary` + sublinhado (critério 8).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "styles \(C9\)"`

**C10** - Item intermediário sem `href` é texto; `onClick` de link chamado uma vez (critério 9).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "items without href and onClick \(C10\)"`

**C11** - `label` customiza o nome do `<nav>` (critério 10).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "custom label \(C11\)"`

**C12** - Um item só aparece como atual, sem separador (Unresolved 3 da task, assumido).
Proof: `npm test -w @church/ui -- src/components/molecules/Breadcrumb/Breadcrumb.spec.tsx -t "single item \(C12\)"`

### S3 - FilterChip · 4 files · ~8 KB · ~2k

**C13** - Removível: 32px, borda `neutral-999`, raio 8px, `bg-hover`, 500 14/16; "Rede:" 400 `text-secondary` + "Jovens" 600; ✕ 32px "Remover filtro Rede: Jovens" chama `onRemove` uma vez (critério 11).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "removable chip \(C13\)"`

**C14** - Com `onClick`, corpo é botão "Editar filtro Rede: Jovens"; sem, é texto (critério 12).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "editable body \(C14\)"`

**C15** - Hover do corpo e do ✕ `bg-selected`; ✕ pressionado `neutral-alpha/40` (critério 13).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "hover and pressed \(C15\)"`

**C16** - Área de toque de 6px acima e abaixo (critério 14).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "44px hit area \(C16\)"`

**C17** - `disabled`: borda `border-default`, fundo transparente, `text-disabled`, botões desabilitados, nenhum callback (critério 15).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "disabled \(C17\)"`

**C18** - Toggle: `Chip` com `aria-pressed`; ícone `check` quando `selected`, senão `iconName`; `onClick` chamado (critério 16).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "toggle chip \(C18\)"`

**C19** - `variant` explícito vence a dedução por `onRemove` (critério 17).
Proof: `npm test -w @church/ui -- src/components/molecules/FilterChip/FilterChip.spec.tsx -t "explicit variant \(C19\)"`

### S4 - Alert · 4 files · ~8 KB · ~2k

**C20** - Padrão `success`: `positive-subtle`, borda `green-alpha/40`, `check_circle` preenchido 20px `text-positive`, título 600 14/20 `text-positive`, padding 12, gap 12, raio 10, até 448px (critério 18).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "success alert \(C20\)"`

**C21** - `info`/`error`/`warning`: fundo, borda, ícone e cor do título da tabela do critério 19.
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "variants \(C21\)"`

**C22** - Prefixo oculto "Sucesso: ", "Informação: ", "Erro: ", "Atenção: " no título (critério 20).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "hidden status word \(C22\)"`

**C23** - `children` em 400 14/20 `text-primary`, gap 4px (critério 21).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "description \(C23\)"`

**C24** - `actions` em linha com gap 8px, 12px abaixo do texto (critério 22).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "actions \(C24\)"`

**C25** - `onClose`: botão 32×32 "Fechar aviso" (ou `closeLabel`), ícone 20px, chama `onClose`; sem `onClose`, sem botão (critério 23).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "close button \(C25\)"`

**C26** - `live`: `role="alert"` no `error`, `role="status"` nos demais; sem `live`, sem `role` (critério 24).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "live region \(C26\)"`

**C27** - `iconName` substitui o ícone do `variant` (critério 25).
Proof: `npm test -w @church/ui -- src/components/molecules/Alert/Alert.spec.tsx -t "custom icon \(C27\)"`

### S5 - RadioGroup, Radio no grupo e a correção de densidade · 10 files · ~45 KB · ~12k

**C28** - `<fieldset role="radiogroup" aria-labelledby>` + `<legend>` 500 16/24 `text-primary`, 4px abaixo; `legendHidden` oculta e mantém o nome (critério 26).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "fieldset and legend \(C28\)"`

**C29** - Radios herdam `name` (informado ou gerado), `size`, `disabled`; marcado = valor do grupo (critério 27).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "options inherit from the group \(C29\)"`

**C30** - `defaultValue` + clique chama `onChange("primeira", event)`; `value` controlado só muda pela prop (critério 28).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "uncontrolled and controlled \(C30\)"`

**C31** - Seta para baixo marca e foca a próxima opção habilitada (critério 29).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "arrow keys select \(C31\)"`

**C32** - `helperText` 400 14/20 `text-secondary` sob a legenda, em `aria-describedby` (critério 30).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "helper text \(C32\)"`

**C33** - `error`: mensagem com ícone `error` e `text-danger`, `aria-invalid="true"`, no `aria-describedby`, círculos `red-67` (critério 31).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "error state \(C33\)"`

**C34** - Padrão obrigatório: " \*" `aria-hidden` + `aria-required="true"`; `optional`: sem asterisco nem `aria-required`, "(Opcional)" (critério 32).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "required by default \(C34\)"`

**C35** - `orientation="horizontal"`: linha com quebra e 24px entre colunas (critério 33).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "horizontal \(C35\)"`

**C36** - `card`: padding 16, borda 1px `border-default`, raio 12, `bg-surface`, 8px entre cartões, descrição com entrelinha 20 (critério 34).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "card options \(C36\)"`

**C37** - Cartão marcado: borda `neutral-999` + 1px interno; hover `bg-hover` + borda `neutral-33`; pressionado `bg-selected` (critério 35).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "card states \(C37\)"`

**C38** - Foco no cartão: anel 2px offset 2 no cartão inteiro, não no círculo (critério 36).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "card focus ring \(C38\)"`

**C39** - Cartão com `error`: borda `red-67`; cartão `disabled`: `bg-hover`, `border-default`, sem borda interna (critério 37).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "card error and disabled \(C39\)"`

**C40** - `card` + horizontal: grade de colunas de no mínimo 200px (critério 38).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "card grid \(C40\)"`

**C41** - `disabled` no grupo desabilita todas as opções (critério 39).
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "disabled group \(C41\)"`

**C42** - Painel: opções `default` a 12px, Radio sem altura mínima nem padding; App: gap 0, Radio min 44px com padding 10px (6px no `large`); `card` mantém 8px; compilado pelo Tailwind com `panel:` e `[data-viewport]` (critérios 40, 41, 43).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "radio density resolves in CSS \(C42\)"`
Proof: `npm test -w @church/ui -- src/components/molecules/RadioGroup/RadioGroup.spec.tsx -t "density classes \(C42\)"`

**C43** - Radio solto continua com `name`, `checked` e `size` próprios; os testes do lote 1 seguem verdes (critério 42).
Proof: `npm test -w @church/ui -- src/components/atoms/Radio/Radio.spec.tsx`

**C44** - Toggle: altura mínima de 44px da linha só no App; área de toque do trilho sempre (critério 44).
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "toggle row height resolves in CSS \(C44\)"`
Proof: `npm test -w @church/ui -- src/components/atoms/Toggle/Toggle.spec.tsx -t "44px hit area \(C42\)"`

### S6 - EmptyState · 5 files · ~10 KB · ~3k

**C45** - Padrão: coluna centralizada, gap 16, padding 32×16; círculo 80px `bg-hover` `text-secondary`; `inbox` 48px contorno peso 300 `aria-hidden`; título `<h3>` 600 16/24 (critério 45).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "default empty state \(C45\)"`

**C46** - `description` 400 16/24 `text-secondary`, gap 4, texto até 420px (critério 46).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "description \(C46\)"`

**C47** - `headingLevel` 2–6 define o heading (critério 47).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "heading level \(C47\)"`

**C48** - `success`: `task_alt` preenchido, `positive-subtle`, `text-positive`; `actions` não renderizadas (critério 48).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "success drops actions \(C48\)"`

**C49** - `error`: `error` preenchido, `danger-subtle`, `text-danger`, `role="status"` (critério 49).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "error status \(C49\)"`

**C50** - `actions` centralizadas, com quebra, gap 8 (critério 50).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "actions \(C50\)"`

**C51** - `page`: altura mínima 360, centro vertical, padding 48×24 (critério 51).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "page variant \(C51\)"`

**C52** - `small`: gap 12, padding 24×16, círculo 56, ícone 32, descrição 14/20 (critério 52).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "small size \(C52\)"`

**C53** - `compact`: linha à esquerda, gap 12, padding 12×16, círculo 32, ícone 20, texto flex com gap 2, título 500 14/20, descrição 400 12/16, ações sem quebra (critério 53).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "compact variant \(C53\)"`

**C54** - `iconName` substitui o ícone; `illustration` substitui o círculo (critério 54).
Proof: `npm test -w @church/ui -- src/components/molecules/EmptyState/EmptyState.spec.tsx -t "custom icon and illustration \(C54\)"`

### S7 - StatCard e SubInfo · 6 files · ~10 KB · ~3k

**C55** - `<article aria-labelledby>`, padding 24, gap 24, raio 16, `bg-surface`, sem sombra; rótulo 400 14/16 `text-secondary`; "1.284" em Oswald 700 36/40, caixa alta, tabular, `text-primary` (critério 55).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "medium card \(C55\)"`

**C56** - `iconName` antes do rótulo, 16px, gap 8 (critério 56).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "icon \(C56\)"`

**C57** - `format` BRL mostra o resultado de `Intl.NumberFormat('pt-BR', format)` ("R$ 2.115,00"); string aparece como veio (critério 57).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "number formatting \(C57\)"`

**C58** - `trend` 500 12/16 `text-positive`, 8px à esquerda, sem caixa alta (critério 58).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "trend \(C58\)"`

**C59** - `help`: botão 24px redondo `text-secondary`, `info` 16px, nome "Sobre Membros ativos: …", texto num `Tooltip` no hover/foco (critério 59).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "help button \(C59\)"`

**C60** - `subs`: linha com quebra, gap 12; SubInfo com ícone 14, valor pt-BR 500 12/16 `text-primary`, rótulo 400 12/16 `text-secondary`, gap 4 (critério 60).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "sub infos \(C60\)"`

**C61** - `small`: padding e gap 12, valor 24/30 (critério 61).
Proof: `npm test -w @church/ui -- src/components/molecules/StatCard/StatCard.spec.tsx -t "small card \(C61\)"`

### S8 - AvatarContent · 4 files · ~6 KB · ~2k

**C62** - `<section aria-label="Pessoa Exemplo">`, padding 24, gap 18, raio 16, `bg-surface`, borda `border-default`; linha com gap 16: Avatar `large` decorativo + `<h3>` 600 20/28 (critério 62).
Proof: `npm test -w @church/ui -- src/components/molecules/AvatarContent/AvatarContent.spec.tsx -t "identity header \(C62\)"`

**C63** - `description` 400 14/20 `text-secondary`; `badges` em linha com quebra, gap 8, 4px acima (critério 63).
Proof: `npm test -w @church/ui -- src/components/molecules/AvatarContent/AvatarContent.spec.tsx -t "description and badges \(C63\)"`

**C64** - `meta` vira `<dl>` em grade de colunas ≥ 120px, gap 12; `<dt>` 500 12/16 `text-secondary`; `<dd>` 500 14/20, 2px acima (critério 64).
Proof: `npm test -w @church/ui -- src/components/molecules/AvatarContent/AvatarContent.spec.tsx -t "meta list \(C64\)"`

**C65** - `headingLevel` 2, 3 ou 4 (critério 65).
Proof: `npm test -w @church/ui -- src/components/molecules/AvatarContent/AvatarContent.spec.tsx -t "heading level \(C65\)"`

### S9 - ListItem · 4 files · ~12 KB · ~3k

**C66** - Estático: `<li>` com `<div>` min 64, padding 8×16, gap 12; título 500 16/24 e subtítulo 400 14/16 `text-secondary` truncados, gap 2; sem chevron (critério 66).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "static item \(C66\)"`

**C67** - `leading` `text-secondary` com ícones 24px; `trailing` 400 14/16 `text-secondary`, gap 8 (critério 67).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "leading and trailing \(C67\)"`

**C68** - `href`: `<a href>` de ponta a ponta, `chevron_right` 20px, cursor pointer, raio 8, hover `bg-hover`, pressionado `bg-selected` (critério 68).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "link item \(C68\)"`

**C69** - `onClick`: `<button type="button">`, clique chama uma vez (critério 69).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "button item \(C69\)"`

**C70** - Foco: contorno `focus-ring` 2px com offset -2px (critério 70).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "inner focus ring \(C70\)"`

**C71** - `compact` min 48 e título 14/20; `comfortable` min 72 (critério 71).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "density \(C71\)"`

**C72** - Divisor 1px `border-default` de 16px à esquerda, exceto no último; `divider={false}` sem divisor (critério 72).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "divider \(C72\)"`

**C73** - `selected`: `aria-current="true"` + `bg-selected` (critério 73).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "selected \(C73\)"`

**C74** - `disabled` + `href`: sem `href`, `aria-disabled`, clique não navega nem chama; textos `text-disabled`; `disabled` + `onClick`: botão `disabled` (critério 74).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "disabled \(C74\)"`

**C75** - `as="label"` com Checkbox: `<label>` sem chevron; clicar na linha alterna o Checkbox (critério 75).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "label row toggles the checkbox \(C75\)"`

**C76** - `chevron` decide o chevron; `action` fica fora da área principal, padding direito 8 (critério 76).
Proof: `npm test -w @church/ui -- src/components/molecules/ListItem/ListItem.spec.tsx -t "chevron and action \(C76\)"`

### S10 - MenuDropdown e MenuItem · 5 files · ~14 KB · ~4k

**C77** - Fechado: `trigger` com `aria-haspopup="menu"`, `aria-expanded="false"`, `aria-controls`; sem menu (critério 77).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "closed trigger \(C77\)"`

**C78** - Clique abre `role="menu"` 4px abaixo (esquerda; direita com `align="end"`), min 180, padding 8, raio 16, `bg-surface`, sombra `elevation-low-bottom-12`, borda `border-default`; foco no primeiro habilitado; `aria-expanded="true"` (critério 78).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "opens below the trigger \(C78\)"`

**C79** - Item `<button role="menuitem" tabindex="-1">` min 36, padding 8×12, gap 8, raio 8, 500 14/16 `text-primary`, ícone 20; hover/foco `bg-hover`; pressionado/`active` `bg-selected` (critério 79).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "menu item \(C79\)"`

**C80** - `color="destructive"` → `text-danger`; `disabled` → `text-disabled`, pulado pelas setas, sem `onSelect` (critério 80).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "destructive and disabled items \(C80\)"`

**C81** - Setas movem o foco entre habilitados, com volta (critério 81).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "arrow navigation wraps \(C81\)"`

**C82** - Clique, Enter ou Espaço num item fecha e chama `onSelect` uma vez (critério 82).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "selecting closes \(C82\)"`

**C83** - Esc fecha e devolve o foco ao `trigger`; Tab fecha; clique fora fecha (critério 83).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "dismissal \(C83\)"`

**C84** - Todos os itens `disabled`: o foco fica no menu e Esc fecha (Unresolved 4 da task, assumido).
Proof: `npm test -w @church/ui -- src/components/molecules/MenuDropdown/MenuDropdown.spec.tsx -t "no enabled item \(C84\)"`

### S11 - DatePicker · 5 files · ~25 KB · ~7k

**C85** - Hoje 2026-10-08, `initialMonth` outubro: cabeçalho "Mês anterior", "Mês" = Outubro, "Ano" = 2026, "Próximo mês"; `grid` nomeado "outubro de 2026" (`aria-live="polite"`); dom…sáb com `abbr`; 4 células vazias antes do dia 1 (critério 84).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "month grid \(C85\)"`

**C86** - Nome do dia "quinta-feira, 8 de outubro de 2026, hoje"; hoje com peso 600, contorno interno 1px `neutral-999` e ponto de 4px (critério 85).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "today \(C86\)"`

**C87** - Dia redondo 400 14/16 tabular; 40×40 no Painel, 44×44 no App (compilado); hover `bg-hover`, pressionado `bg-selected` (critério 86).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "day button \(C87\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "datepicker day size resolves in CSS \(C87\)"`

**C88** - `single`: clique no 15 chama `onChange("2026-10-15")`; selecionado `action-primary` + `text-inverse` + 600, hover `neutral-100`, célula `aria-selected="true"` (critério 87).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "single selection \(C88\)"`

**C89** - Um dia tabulável; ←/→ ±1, ↑/↓ ±7, Home/End domingo/sábado, PageUp/PageDown ±1 mês, Shift ±1 ano (troca a grade); Enter/Espaço selecionam; Esc chama `onCancel` (critério 88).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "keyboard \(C89\)"`

**C90** - `min`/`max`: fora do intervalo com `aria-disabled`, riscado, `text-disabled`, motivo "Antes de 05/10/2026, a primeira data permitida" / "Depois de 20/10/2026, a última data permitida" no nome; clique sem `onChange`; botões de mês desabilitados quando o vizinho está fora (critério 89).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "min and max \(C90\)"`

**C91** - `disabledDates` com motivo no nome e num `Tooltip`; `true` → "Data indisponível" (critério 90).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "disabled dates \(C91\)"`

**C92** - `range`: 10 depois 6 → `{start:"2026-10-10",end:null}` e `{start:"2026-10-06",end:"2026-10-10"}`; faixa contínua `bg-selected` com pontas arredondadas; prévia no hover (critério 91).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "range selection \(C92\)"`

**C93** - Atalhos "Hoje"/"Ontem" abaixo de borda 1px `border-default`, gap 8; selecionam e mostram o mês; desabilitados se bloqueados (critério 92).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "shortcuts \(C93\)"`

**C94** - Seletores de mês e ano trocam a grade; anos do maior ao menor por `yearRange`, `min`–`max` ou hoje −100…+5 (critério 93).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "month and year selects \(C94\)"`

**C95** - `value`/`min`/`max` fora de `YYYY-MM-DD` tratados como ausentes: nada selecionado, grade no mês de hoje (Unresolved 5 da task, assumido).
Proof: `npm test -w @church/ui -- src/components/molecules/DatePicker/DatePicker.spec.tsx -t "invalid iso is ignored \(C95\)"`

### S12 - NavItem `count` e Cell `avatarGroup` · 8 files · ~40 KB · ~10k

**C96** - `count={3}`: CountBadge "3" ("3 novos") depois do rótulo `flex-1`; 0, ausente ou `collapsed` sem CountBadge; `count` nos `items` da Navigation chega ao NavItem (critério 94).
Proof: `npm test -w @church/ui -- src/components/atoms/NavItem/NavItem.spec.tsx -t "count badge \(C96\)"`
Proof: `npm test -w @church/ui -- src/components/molecules/Navigation/Navigation.spec.tsx -t "forwards count \(C96\)"`

**C97** - `<Cell type="avatarGroup" people>`: AvatarGroup `xSmall` com todos os nomes (critério 95).
Proof: `npm test -w @church/ui -- src/components/atoms/Cell/Cell.spec.tsx -t "avatar group cell \(C97\)"`

### S13 - Entrega no design system · 5 files · ~25 KB · ~6k

**C98** - As 10 molecules resolvem por `@church/ui/molecules/<Nome>` e o AvatarGroup por `@church/ui/atoms/AvatarGroup`; os tipos `ISODate` e `DateRange` são exportados do DatePicker (critério 96).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "lote 2 resolves through the package exports \(C98\)"`

**C99** - Stories de Breadcrumb, Alert, StatCard, AvatarContent e MenuDropdown apontam para `13601:3774`, `13792:9332`, `13619:2165`, `13803:10719` e `13033:3147` (critério 96).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "story design links"`

**C100** - Cada componente novo tem spec, story e linha em `figma-components.md`; a linha "Menu dropdown — Not built yet" não existe mais (critério 96).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "lote 2 is documented \(C100\)"`

**C101** - Os ícones 32 e 48 existem em `@church/tokens` e têm utilitário `text-icon-32`/`text-icon-48` compilado.
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "icon sizes 32 and 48 \(C101\)"`

**C102** - O gate completo passa sem cache.
Proof: `npm run verify -- --force`

## Swept

- validation: C4 (`max`), C90 (`min`/`max`), C91 (datas bloqueadas), C95 (ISO inválido)
- failure modes: n/a - nenhum componente chama algo que falhe
- idempotency: n/a - sem efeito persistido; callbacks uma vez por ação (C13, C82, C88)
- authorization: n/a - componentes não acessam dados
- concurrency: C92 - ordem dos cliques do range normalizada
- data lifecycle: n/a - nada é persistido
- dependency failure: n/a - sem rede; `Intl` do runtime (C57)
- state transitions: C77–C83, C92
- observability: n/a - sem log (constituição XIV)

## Coverage

| Set (size)                              | Member -> proof                                                                        | Unproven |
| --------------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| tamanhos do Avatar no grupo (5)         | xSmall · small · medium · large · xLarge em C3 (table-driven)                          | -        |
| `variant` do Alert (4)                  | success C20 · info, error, warning C21                                                 | -        |
| `status` do EmptyState (3)              | neutral C45 · success C48 · error C49                                                  | -        |
| `variant` do EmptyState (3)             | inline C45 · page C51 · compact C53                                                    | -        |
| densidade do ListItem (3)               | default C66 · compact, comfortable C71                                                 | -        |
| forma da área principal do ListItem (4) | div C66 · a C68 · button C69 · label C75                                               | -        |
| teclas do DatePicker (10)               | ← → ↑ ↓ Home End PageUp PageDown Shift+PageUp/PageDown Enter/Espaço Esc em C89         | -        |
| densidade do Radio/Toggle (4 caminhos)  | `panel:` · sem prefixo · `data-viewport=mobile` · `data-viewport=desktop` em C42 e C44 | -        |
| stories com nó (5)                      | C99                                                                                    | -        |
| exports novos (11)                      | table-driven em C98 e C100                                                             | -        |

- Nenhum check afirma status code, rota ou formato de resposta.
- C42, C44, C87 e C101 cruzam o limite do CSS compilado; os demais afirmam classes e DOM no jsdom.

## Handoff

Pesos (floor de `wc -c`/4 dos arquivos lidos e escritos, mais as regras do artefato): S1–S8 e S12
≈ 52k (atoms e molecules de exibição e formulário, mais os ajustes em Avatar, Radio, Toggle,
NavItem e Cell); S9–S11 e S13 ≈ 20k de código novo, mas o DatePicker e o MenuDropdown concentram a
lógica de teclado e de estado, onde a iteração costuma passar de três vezes o floor. Os dois
cabem num lote só pelo floor (≈ 72k), mas a superfície muda em S9: dali em diante o código é novo
e interativo, sem tocar atom existente. Divisão: **lote A = S1–S8 + S12** (C1–C65, C96, C97);
**lote B = S9–S11 + S13** (C66–C95, C98–C102), depois do A verde.

### Lote A (S1–S8, S12)

- **Onde o lote fechou:** C1–C65, C96 e C97, todos verdes no working tree sobre `4bedcdf` (sem
  commit). `npm run verify -- --force`: 10/10 tarefas, 37 suítes, 714 testes. Arquivos:
  - tokens: `packages/tokens/src/icon.ts` (32 e 48);
  - tema: `packages/ui/src/styles.css`, `packages/ui/src/lib/tw-theme-extension.ts`,
    `packages/ui/src/styles.spec.ts` (C42, C44);
  - atoms novos: `atoms/AvatarGroup/` (componente, spec, story, index);
  - atoms alterados: `Avatar` (`decorative`, `avatar` exportado), `Radio` (`Radio.context.ts`,
    `data/`, grupo, card, densidade), `Toggle` (`data/`, densidade), `NavItem` (`count`), `Cell`
    (`avatarGroup`), com specs e stories;
  - molecules novas: `Breadcrumb`, `FilterChip`, `Alert`, `RadioGroup` (com `data/`),
    `EmptyState`, `StatCard` (com `components/SubInfo.tsx`) e `AvatarContent`;
  - `molecules/Navigation/Navigation.spec.tsx` (novo).
- **O que foi decidido durante o build:**
  - Duas linhas novas em Landing: o contexto do grupo mora no atom (`Radio.context.ts`) e os
    valores nomeados no `@theme` (`grid-cols-fill-50`/`-fill-30` e `ring-surface`).
  - Os ícones 32 e 48 entraram nos tokens e no `twMergeConfig` já neste lote, porque o EmptyState
    (S6) usa os dois; o teste do C101 continua com o lote B.
  - O C23 do Radio e o C42 do Toggle (lote 1) passaram a afirmar as classes só de App
    (`min-h-11` + `panel:not-in-data-[viewport=mobile]:min-h-0` + `in-data-[viewport=desktop]:…`),
    que é a correção dos critérios 43 e 44. O trilho do Toggle mantém `after:h-11` sempre.
  - O tamanho do Radio segue a regra do Lamb: a prop do Radio vence, senão vale a do grupo.
  - Com `optional`, o "(Opcional)" fica dentro da `<legend>`, então o nome do grupo passa a ser
    "Tipo de visitante (Opcional)". O asterisco é `aria-hidden`.
  - **Achado sobre as provas:** no `-t` do Jest os parênteses são um grupo de regex, então
    `-t "overflow and group name \(C1\)"` não casa com o nome literal e o Jest pula a suíte inteira
    com saída 0. O mesmo vale para as provas do lote 1. Para os testes rodarem de verdade, use
    `-t "overflow and group name \(C1\)"`. Os nomes dos testes ficaram como o checklist manda, e
    uma conferência por `--json` mostrou que cada prova de C1–C65, C96 e C97 casa com um teste que
    passa.
- **O que foi abandonado:**
  - A sobreposição do AvatarGroup por `[&>*+*]:-ml-*`. Ficou `not-first:-ml-*` em cada Avatar e
    no "+N".
  - O `::after` do FilterChip no contêiner, como no `bundle.css`. Lá ele tem
    `pointer-events: none`, então não aumenta o alvo. Cada botão ganhou o próprio `::after` de
    6px, como o Chip.
  - Navegação por setas própria no RadioGroup: os radios nativos com o mesmo `name` já fazem
    isso, e o C31 prova o comportamento.
  - Os `console.warn` do RadioGroup (mais de 5 opções) e do EmptyState (positivo com ações) não
    foram feitos, porque estão fora do escopo.
  - Nota: o `console.error` "Not implemented: window.scrollTo" no `verify` vem do
    `NavItem.spec.tsx` do `motion` e já acontecia em `4bedcdf`.

### Lote B (S9–S11, S13)

- **Onde o lote fechou:** C66–C95 e C98–C102, todos verdes no working tree sobre `4bedcdf` (sem
  commit), com o lote A intacto. `npm run verify -- --force`: 10/10 tarefas, 40 suítes, 782
  testes. Uma rodada única das provas (`--json`) mostrou que cada `-t` de C66–C95 e C98–C101 casa
  com pelo menos um teste que passa (80 testes). Arquivos:
  - novos: `molecules/ListItem/` (componente, spec, story, index); `molecules/MenuDropdown/`
    (com `components/MenuItem.tsx`, exportado pelo barrel); `molecules/DatePicker/` (com
    `DatePicker.types.ts` e `data/index.ts`: `DAY_SIZE`, nomes pt-BR e a aritmética de `Date`
    local);
  - alterados: `src/styles.spec.ts` (C87 tamanho do dia compilado, C101 ícones 32/48),
    `src/figma-links.spec.ts` (5 linhas novas em `NODES`, C98 e C100) e
    `packages/docs/figma-components.md` (11 linhas; a linha "Menu dropdown — Not built yet" saiu).
- **O que foi decidido durante o build:**
  - Uma linha nova em Landing: as props do DatePicker são uma união discriminada por `mode`, e
    `ISODate`/`DateRange` saem do barrel por `export type *`.
  - O `label` do DatePicker (padrão "Calendário") nomeia a raiz como `role="group"`; o
    `bundle.js` aceita a prop mas não a usa.
  - O foco do DOM só segue o dia focado depois de uma tecla na grade ou de um clique num dia. Os
    botões de mês, os seletores e os atalhos mudam o mês sem tirar o foco de onde ele está (o Lamb
    puxa o foco para a grade também nesses casos). O dia inicial também respeita `min`, e não só
    `max` como no `bundle.js`.
  - MenuDropdown: o `onClick` original do `trigger` continua sendo chamado. Ao selecionar um item e
    ao apertar Tab, o foco volta ao `trigger` antes de o menu fechar; assim o Tab segue a partir
    dele e não do `body`.
  - ListItem: o `leading` aplica 24px e `text-current` ao Icon padrão (`outlined`) por
    `[&_.material-symbols-outlined]:` (precedente: `[&_input…]` do SearchField). O divisor é um
    `::after` de altura 0 com `border-b border-default` sob `not-last:`, porque `border-default`
    só existe como cor de borda.
- **O que foi abandonado:**
  - O `Home`/`End` no MenuDropdown: o critério 81 só pede as setas, e o `bundle.js` não tem essas
    teclas.
  - Estado interno de valor no DatePicker: como no Lamb, ele é só controlado (`value` +
    `onChange`), e a story guarda o estado.
