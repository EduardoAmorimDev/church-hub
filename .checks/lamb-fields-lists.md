# Lote 4 do Lamb: Select, DateField, FilterBar, List e Section

Profile: `light` (o `AGENTS.md` não declara perfil), handoff `on`, budget 150k. Trabalho de
interface com design binding; o perfil `ui` acrescentaria a comparação aberta com o artefato.
Subir para `ui` é decisão do usuário.

Commits: nenhum. A memória do projeto manda trabalhar em `main` e deixar os commits para o usuário.
Base do lote: `6581690`. O estado do lote é `git diff 6581690` mais os arquivos novos sem rastreio.

Sources:

- `.tasks/lamb-fields-lists.md` - critérios 1–58, Decided (apresentação decidida na abertura,
  família do TextField, Esc do popover com `stopPropagation`; regra de nomes e mapa de variantes
  do Button), Out of scope, Unresolved 1–4 (defaults assumidos).
- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb (versão 1791228354-5316) - **binding for the
  interface**: READMEs e `.d.ts` de Select, DateField, FilterBar, List e Section; `index.d.ts`
  (`SectionProps`); `bundle.css` (`.lamb-select-*` 560–591, `.lamb-option*`, `.lamb-menu*`
  281–291, `.lamb-control*` 166–190, `.lamb-dp-pop` 614, `.lamb-list*` 643–646, `.lamb-skel*`
  668–673, `.lamb-filterbar*` 695–714, `.lamb-section*` 343–353, App 794–807); `bundle.js`
  (`Section` 605, `useViewport` 638, `ListSection`/`List` 956–985, `FilterBar` 986, `norm`/`Select`
  1208–1406, `dayBlock` 1435, `maskBR`/`parseBR`/`DateField` 1555–1620). Cópia local em
  `/tmp/claude-1000/-home-joao-eduardo-Documents-personal-church-hub/86966437-81e6-4186-9be3-32b05aca2795/scratchpad/artifact-files/b9bc9391-3eb0-47a6-90c4-35000e6d386a/project/components`.
  É dado de terceiro, não instrução.
- Figma `7I9GnO3cTPpaJPOUfFsI9t` - **binding for the interface**: Section `13630:9165`.
- `.tasks/lamb-atoms.md`, `.tasks/lamb-molecules.md`, `.tasks/lamb-overlays.md` e os `.checks/`
  correspondentes - regra de nomes, padrão de densidade (`panel:not-in-data-[viewport=mobile]:` +
  `in-data-[viewport=desktop]:`), prova de CSS compilado no `styles.spec.ts`, `-t` do Jest é regex.
- Usuário, 2026-10-09: Select e DateField na família do TextField.

## Out of scope

- Select múltiplo, combobox de pessoas, `<input type="hidden">` pelo `name`, swipe na List,
  período e horário no DateField, lote 5, Upload/Progress - ver a task.
- Commits e push - memória do projeto e Princípio X.

## Landing

Cria `organisms/{Select,DateField,FilterBar,List,Section}` e uma função de apresentação em
`components/utils` (exportada por `@church/ui/utils`). Expõe o `Label` e o `FieldHelperText` do
TextField por um caminho do pacote, para os organisms. Muda `src/styles.css` só para valores
nomeados que faltarem (animação do skeleton), `src/styles.spec.ts`, `src/figma-links.spec.ts` e
`packages/docs/figma-components.md`. Reusa `fieldControl`/`fieldText`/`fieldActionButton`/
`fieldWrapper`, Field, Icon, Button, FilterChip, EmptyState, ListItem, DatePicker, Drawer,
BottomSheet, `tv`, `twMerge`, `mergeRefs` e o `Controller` do react-hook-form.

| One-way door                                                          | Literal shape                                                                                                                                                                                                                                            | Alternative rejected                                                                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Apresentação decidida na abertura (task, Decided 1)                   | `resolveViewport(element: Element \| null): 'mobile' \| 'desktop'` em `@church/ui/utils`: `closest('[data-viewport]')`, senão `matchMedia('(max-width: 959px)')`, senão `desktop`. Chamada só no handler que abre; o resultado fica em estado até fechar | `useViewport` com estado e listener - redesenho depois da hidratação e troca ao vivo com a lista aberta                                        |
| Família do TextField (task, Decided 2)                                | `label`, `helperText`, `state`, `optional`, `size`, `control`, `name`, `rules`, `slotProps`, `tooltip`; `name` liga por `Controller`, genérico em `TFieldValues`                                                                                         | API do Lamb (`hint`, `error`, `required`, input hidden)                                                                                        |
| Esc do popover (task, Decided 3)                                      | `onKeyDown` do Select e do DateField chama `event.stopPropagation()` no Esc que trata                                                                                                                                                                    | registrar o popover no `useModalLayer`                                                                                                         |
| `defaultOpen` com `presentation="auto"` (build, achado 5 do Verifier) | o Select monta aberto como popover e um `useLayoutEffect` de montagem chama `resolveViewport` uma vez, antes da pintura no cliente; é a "abertura" desse caso. hazard: com SSR numa tela estreita, o HTML do servidor traz o popover até a hidratação    | chamar só no handler: `defaultOpen` ficaria sempre popover em `auto`, contra o critério 1; ou não abrir até a hidratação: contra o critério 23 |
| Funções de data públicas no DatePicker (build, achado 10)             | `@church/ui/molecules/DatePicker` passa a exportar `blockReason`, `formatBR`, `fromISO` e `toISO`, reusadas pelo DateField                                                                                                                               | duplicar as quatro funções no DateField: as mensagens de bloqueio do calendário e do campo poderiam divergir                                   |

- Nothing else in this change is hard to reverse.

## Checks

Comando base: `npm test -w @church/ui -- <arquivo> -t "<nome>"` (arquivos relativos a
`packages/ui`). hazard: o `-t` é regex, por isso os parênteses vão escapados (`\(C1\)`); sem o
escape o Jest pula tudo e sai com 0. O número de cada check é o do critério da task, que guarda os
valores literais.

### S1 - Apresentação no Painel e no App · 3 files · ~9 KB · ~2k

**C1** - Abrir decide: ancestral `[data-viewport="mobile"]` ou (sem ancestral) `max-width: 959px` → App; o resto, inclusive `[data-viewport="desktop"]` em tela estreita, → Painel; sem `matchMedia` → Painel (critério 1).
Proof: `npm test -w @church/ui -- src/components/utils/resolveViewport.spec.ts -t "resolves the viewport \(C1\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "auto presentation \(C1\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "auto presentation \(C1\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "panel auto presentation \(C1\)"`

**C2** - Fechado, o HTML do Select e do DateField é o mesmo com `matchMedia` de App e de Painel (critério 2).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "closed markup ignores the viewport \(C2\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "closed markup ignores the viewport \(C2\)"`

**C3** - `presentation="popover"`/`"sheet"` vencem a largura e o `[data-viewport]` (critério 3).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "forced presentation \(C3\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "forced presentation \(C3\)"`

**C4** - Aberto, mudar o `matchMedia` não troca a apresentação; a próxima abertura usa o novo valor (critério 4).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "presentation is fixed while open \(C4\)"`
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "panel presentation is fixed while open \(C4\)"`

### S2 - Select · 9 files · ~32 KB · ~8k

**C5** - Rótulo/asterisco/"(Opcional)" do TextField; caixa `fieldControl` com 32/48/56px; gatilho `combobox` com `tabindex=0`, `aria-haspopup=listbox`, `aria-expanded`, `aria-controls`, `aria-labelledby` (rótulo + valor), `aria-required`, `aria-describedby` (critério 5).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "field markup \(C5\)"`

**C6** - Placeholder "Selecione" (ou `placeholder`) em `text-secondary`; valor = `label` em `text-primary`, ícone da opção antes, corte com reticências (critério 6).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "value display \(C6\)"`

**C7** - `expand_more` à direita gira 180° em 150ms ease-out aberto; aberto, borda e anel de 1px `focus-ring` (critério 7).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "open chevron and ring \(C7\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "Select focus ring \(C7\)"`

**C8** - `clearable` com valor: botão `close` "Limpar {label}"/"Limpar seleção" chama `onChange(null, null)`, mostra o placeholder e foca o gatilho; sem valor, sem botão (critério 8).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "clear button \(C8\)"`

**C9** - `disabled`: `tabindex=-1`, `aria-disabled`, visual desabilitado, clique e teclado não abrem (critério 9).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "disabled \(C9\)"`

**C10** - Popover: 4px abaixo, largura da caixa, `z-30`, padding 4, raio 16, `bg-surface`, borda `border-default`, sombra `elevation-low-bottom-12`, altura máxima 344px; `listbox` nomeada pelo rótulo com altura máxima 288px e rolagem (critério 10).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "popover markup \(C10\)"`

**C11** - Opção `role=option` com `aria-selected`/`aria-disabled`; 40px Painel / 44px App; padding 8×12, raio 8, gap 8, 500 14/16; ícone 20; `description` 400 12/16; selecionada `bg-selected` + `check`; ativa `bg-hover` + contorno 2px interno; desabilitada `text-disabled`, `cursor-not-allowed`, clique inerte (critério 11).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "option markup \(C11\)"`

**C12** - Clique alterna; ↓ ↑ Enter Espaço abrem; ativa = selecionada ou primeira habilitada, rolada para a vista, apontada por `aria-activedescendant` (critério 12).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "opens \(C12\)"`

**C13** - Aberto: ↓/↑ pulam desabilitadas e param nas pontas; Home/End; Enter (e Espaço sem busca) chamam `onChange(value, option)` uma vez, fecham e focam o gatilho; Tab fecha sem escolher (critério 13).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "keyboard navigation \(C13\)"`

**C14** - Typeahead sem busca: letras em < 600ms acumulam, sem acento nem caixa ("sa" → "São João"); após 600ms recomeça (critério 14).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "typeahead \(C14\)"`

**C15** - Esc fecha e foca o gatilho; dentro de um Dialog, o Dialog não recebe `onClose` (critério 15).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "escape \(C15\)"`

**C16** - Mouse fora fecha sem escolher e sem mover o foco; hover ativa opção habilitada; clique escolhe; `mousedown` na opção não tira o foco (critério 16).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "pointer \(C16\)"`

**C17** - `searchable`: linha de busca (ícone 20, padding 8×12, borda inferior, 16/24, linha interna de 2px no foco); input "Buscar"/`searchPlaceholder`, nome "Buscar em {label}"/"Buscar em opções", `combobox` com `aria-autocomplete=list`, `aria-expanded=true`, `aria-controls`, `aria-activedescendant`; foco ao abrir no popover (critério 17).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "search markup \(C17\)"`

**C18** - Busca filtra `label` ou `description` sem acento nem caixa ("joao" → "São João"); ativa vira a primeira habilitada; letra no gatilho fechado abre com a busca preenchida; fechar esvazia (critério 18).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "search filters \(C18\)"`

**C19** - Busca vazia: `role=status` "Nenhum resultado para “{busca}”" 400 14/20 `text-secondary` + Button `transparent` `neutral` `small` "Limpar busca", que esvazia e foca o input (critério 19).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "empty search \(C19\)"`

**C20** - Sheet: título `label`/"Selecione"; `half` com > 6 opções e `auto` com ≤ 6; lista sem altura máxima, opções ≥ 48px 16/24; busca `sticky` com borda `border-control`, raio 12, ≥ 48px, focada ao abrir; escolher fecha; fechar não escolhe; foco volta ao gatilho (critério 20).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "sheet presentation \(C20\)"`

**C21** - Controlado por `value` (só muda com a prop); não controlado por `defaultValue`; `onChange(value, option)` nos dois (critério 21).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "controlled and uncontrolled \(C21\)"`

**C22** - Com `name` num formulário RHF: valor do formulário; escolher/limpar grava `string`/`null`; fechar marca tocado; erro do campo vira `state="error"` + mensagem, `aria-invalid` no gatilho, borda de erro; fora do formulário, `state="error"` + `helperText` igual (critério 22).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "react-hook-form \(C22\)"`

**C23** - `defaultOpen` sem `disabled` abre no primeiro render do cliente (critério 23).
Proof: `npm test -w @church/ui -- src/components/organisms/Select/Select.spec.tsx -t "defaultOpen \(C23\)"`

### S3 - DateField · 7 files · ~42 KB · ~10k

**C24** - Rótulo do TextField ligado por `htmlFor`; caixa no `size`; input `type=text`, `inputMode=numeric`, `autoComplete=off`, placeholder "dd/mm/aaaa", `maxLength=10`; botão `calendar_month` "Abrir calendário de {label}"/"Abrir calendário", `aria-haspopup=dialog`, `aria-expanded`; `disabled` desabilita os dois (critério 24).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "field markup \(C24\)"`

**C25** - Ajuda "{helperText} Formato dd/mm/aaaa." ou "Formato dd/mm/aaaa.", em `aria-describedby` (critério 25).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "format hint \(C25\)"`

**C26** - Máscara: só dígitos, até 8; "1503" → "15/03"; "15032026" → "15/03/2026" (critério 26).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "mask \(C26\)"`

**C27** - Validação ao sair ou aos 10 caracteres, as seis mensagens da tabela, `state="error"`, `aria-invalid`, sem `onChange` (critério 27).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "validation messages \(C27\)"`

**C28** - Data válida → `onChange('2026-03-15')` uma vez e o erro some; editar abaixo de 10 caracteres apaga o erro local; apagar e sair com valor → `onChange(null)` (critério 28).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "commit \(C28\)"`

**C29** - Erro externo (`state="error"` + `helperText`, ou do formulário) vence o local (critério 29).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "external error wins \(C29\)"`

**C30** - `value="2026-03-15"` mostra "15/03/2026" e acompanha a prop; `defaultValue` não controlado (critério 30).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "controlled and uncontrolled \(C30\)"`

**C31** - Botão ou Alt+↓ abre; popover `role=dialog` "Escolher {label}"/"Escolher data", 4px abaixo, à esquerda, `z-30`, padding 16, raio 16, `bg-surface`, borda, sombra; DatePicker com `value`, `min`, `max`, `disabledDates`, `shortcuts`, `yearRange`, `label`; foco no dia focável (critério 31).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "calendar popover \(C31\)"`

**C32** - Escolher dia ou atalho: `onChange` ISO, input atualizado, fecha, foco no botão (critério 32).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "pick a day \(C32\)"`

**C33** - Esc fecha e foca o botão; dentro de um Dialog, sem `onClose`; mouse fora fecha sem mover o foco (critério 33).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "close the calendar \(C33\)"`

**C34** - Sheet: título `label`/"Escolher data"; DatePicker na largura toda; dias de 44px; escolher fecha; fechar foca o botão (critério 34).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "sheet presentation \(C34\)"`

**C35** - RHF: data do formulário; só ISO válida ou `null`; sair marca tocado; erro do campo como em C29 (critério 35).
Proof: `npm test -w @church/ui -- src/components/organisms/DateField/DateField.spec.tsx -t "react-hook-form \(C35\)"`

### S4 - FilterBar · 5 files · ~13 KB · ~3k

**C36** - Coluna gap 12; primeira linha com quebra, gap 8/12, centralizada; `search` em `flex: 1 1 240px` até 360px (critério 36).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "layout \(C36\)"`

**C37** - Com `panel`: Button `ghost` `neutral` `small`, ícone `tune`, "Filtros"/`filtersLabel`, `aria-haspopup=dialog`, `aria-expanded`; sem `panel`, sem botão (critério 37).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "filters button \(C37\)"`

**C38** - N ≥ 1: pílula `aria-hidden` 20px, `action-primary`/`text-inverse` 600 12/16, nome "Filtros, N ativos"; sem filtros, sem pílula e nome "Filtros" (critério 38).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "active count \(C38\)"`

**C39** - `resultCount`: `<p role=status aria-live=polite>` "{n} resultados" ou `resultLabel(n)`, 500 14/16 `text-secondary`, sem quebra, à direita; sem `resultCount`, nada (critério 39).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "result count \(C39\)"`

**C40** - Filtros ativos: `<ul>` "Filtros ativos", gap 8, FilterChip removível por filtro; ✕ → `onChange` sem aquele `id`; com `panel`, corpo do chip abre o painel; sem filtros, sem linha (critério 40).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "active chips \(C40\)"`

**C41** - "Limpar tudo" (`transparent` `neutral` `small`) só com ≥ 2 filtros, chama `onClear` (critério 41).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "clear all \(C41\)"`

**C42** - App (≤ 959px ou `data-viewport=mobile`): chips sem quebra, rolagem x com `snap proximity`, sem barra; busca na linha toda; contador sem empurrão; `desktop` mantém o Painel (critério 42).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "app density \(C42\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "FilterBar app density \(C42\)"`

**C43** - Painel: Drawer `modal` "Filtros"/`panelTitle` com o `panel`; App: BottomSheet `half`; rodapé "Limpar" (`ghost` `neutral` `medium`, `onClear`, continua aberto) e "Ver resultados" (`filled` `neutral` `medium`, fecha e `onApply`) (critério 43).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "filters panel \(C43\)"`

**C44** - Esc, fundo ou Fechar: sem `onApply` e foco de volta no botão Filtros (critério 44).
Proof: `npm test -w @church/ui -- src/components/organisms/FilterBar/FilterBar.spec.tsx -t "dismiss the panel \(C44\)"`

### S5 - List · 4 files · ~9 KB · ~2k

**C45** - Coluna `text-primary`; `label` → `role=region` nomeada; sem `label`, sem `role` (critério 45).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "region \(C45\)"`

**C46** - Sem seções: `<ul role=list>` sem marcador, margem nem padding; `density` da List (`default`) nos ListItems sem a própria (critério 46).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "plain list and density \(C46\)"`

**C47** - `ListSection`: `<section>` nomeada; `<h3>`/`headingLevel` 500 12/16 `text-secondary`, padding 12/16/4; `<ul role=list>` com densidade herdada; 8px entre seções (critério 47).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "sections \(C47\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "List section spacing \(C47\)"`

**C48** - `loading`: `<ul role=list aria-busy=true>` com `skeletonCount` (3) linhas `aria-hidden` (círculo 32px, barras 12px a 60% e 35%, `bg-selected`, raio 8); "Carregando…" `role=status` oculto; vence o vazio (critério 48).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "loading skeleton \(C48\)"`

**C49** - Pulso de 1,4s ease-in-out infinito com 50% de opacidade no meio; sem animação com `reduce` (critério 49).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "skeleton motion \(C49\)"`
Proof: `npm test -w @church/ui -- src/styles.spec.ts -t "skeleton pulse \(C49\)"`

**C50** - Sem filhos e com `empty`: objeto → EmptyState `inline` `small` com as props; elemento → o próprio (critério 50).
Proof: `npm test -w @church/ui -- src/components/organisms/List/List.spec.tsx -t "empty \(C50\)"`

### S6 - Section · 3 files · ~6 KB · ~1.5k

**C51** - `<section>` nomeada pelo título, coluna, `bg-surface`, raio 16, `min-w-0` (critério 51).
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "section markup \(C51\)"`

**C52** - Cabeçalho com borda inferior; linha de cima padding 16, gap 16, topo, pontas, quebra; `<h2>`/`<h3>` 600 20/28; descrição 400 14/20 `text-secondary` 2px abaixo; ações com gap 8 que quebram (critério 52).
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "header \(C52\)"`

**C53** - `search`/`filters` sem `simple`: segunda linha padding 0/16/16, gap 16, centralizada, pontas, quebra; busca `flex: 1 1 240px` até 309px; filtros gap 8 com quebra; `simple` a remove (critério 53).
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "tools row \(C53\)"`

**C54** - Corpo padding 16, coluna gap 10, `min-w-0`, com os `children` (critério 54).
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "body \(C54\)"`

**C55** - `footer`: borda superior, centralizado, gap 16, padding 16 (`button`) ou 8×16 (`paginator`); sem `footer`, sem rodapé (critério 55).
Proof: `npm test -w @church/ui -- src/components/organisms/Section/Section.spec.tsx -t "footer \(C55\)"`

### S7 - Entrega no design system · 4 files · ~73 KB · ~18k

**C56** - Os cinco importáveis por `@church/ui/organisms/<Nome>`, `ListSection` pelo caminho da List, cada um com spec e story (critério 56).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "lamb batch 4 exports \(C56\)"`

**C57** - Story da Section com `parameters.design` no nó `13630:9165` (critério 57).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "Section"`

**C58** - `packages/docs/figma-components.md` com uma linha para cada um dos cinco e a linha do ListItem sem "come with the organisms" (critério 58).
Proof: `npm test -w @church/ui -- src/figma-links.spec.ts -t "figma-components rows \(C58\)"`

Gate do lote: `npm run verify` (typecheck, lint e test em todos os workspaces) e
`npx prettier --check` nos arquivos tocados.

## Swept

- validation: C27, C22, C35
- failure modes: C27
- idempotency: C13 - `onChange` uma vez por escolha
- authorization: n/a - componentes não acessam dados
- concurrency: C15 e C33 (Esc só na camada de cima), C4 (apresentação fixa enquanto aberta)
- data lifecycle: n/a - nada é persistido
- dependency failure: C1 - sem `matchMedia`, Painel
- state transitions: C12, C13, C15, C16, C20, C32, C33, C34, C43, C44
- observability: n/a - sem log (constituição XIV)

## Coverage

| Set (size)                       | Member -> proof                                                                                                                                                   | Unproven |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| mensagens do DateField (6)       | incompleta · inexistente · antes de `min` · depois de `max` · motivo string · `true`, todas em C27                                                                | -        |
| resolução da apresentação (5)    | `mobile` ancestral · `desktop` ancestral em tela estreita · sem ancestral estreita · sem ancestral larga · sem `matchMedia`, todas em C1 (`resolveViewport.spec`) | -        |
| `presentation` (3)               | `auto` C1 · `popover` C3 · `sheet` C3                                                                                                                             | -        |
| consumidores da apresentação (3) | Select C1/C4/C20 · DateField C1/C3/C34 · FilterBar C1/C4/C43                                                                                                      | -        |
| densidade da List (3)            | `compact` · `default` · `comfortable`, em C46                                                                                                                     | -        |

- Nenhum check afirma status, rota ou payload.

## Handoff

Pesos (floor de `wc -c`/4 dos arquivos lidos, mais as funções do artefato): S1–S3 ≈ 20k, com a
lógica de teclado, busca, máscara e RHF, onde a iteração costuma passar de três vezes o floor; S4–S7
≈ 25k, quase tudo `styles.spec.ts` e `figma-links.spec.ts`, de leitura. Os dois cabem num lote só
pelo floor (≈ 45k), mas a superfície muda em S4: de campos de formulário para composição e layout,
sem tocar Field nem DatePicker. Divisão: **lote A = S1–S3** (C1–C35); **lote B = S4–S7**
(C36–C58), depois do A verde. O lote B reusa o `resolveViewport` do A.

### Lote A (S1–S3)

- **Onde o lote fechou:** C1–C35 verdes; as 38 provas rodaram isoladas com o comando do checklist,
  1 teste cada. `npm run verify` verde (10/10 tarefas, 902 testes). Estado: working tree sobre
  `6581690`, sem commit. Criados `components/utils/resolveViewport.{ts,spec.ts}`,
  `organisms/Select/*` e `organisms/DateField/*`; alterados `components/utils/index.ts` (exporta
  `resolveViewport`, `APP_MEDIA_QUERY` e `Viewport`) e `molecules/DatePicker/index.ts` (exporta
  `blockReason`, `formatBR`, `fromISO` e `toISO`, reusados pelo DateField). `Label` e
  `FieldHelperText` chegam aos organisms por `@church/ui/atoms/TextField/components`, que o curinga
  `./atoms/*` já exportava (o RadioGroup já usa): o TextField não mudou. Nenhum valor novo no tema.
  Leituras para o verificador: com `defaultOpen` e `presentation="auto"`, o primeiro render abre
  como popover e um `useLayoutEffect` de montagem chama `resolveViewport` uma vez, antes da pintura
  (é o "abrir" desse caso; nenhum render chama a função). No sheet sem busca, a listbox recebe o
  foco e o teclado (acréscimo, fora dos critérios).
- **O que o usuário decidiu no meio:** nada.
- **O que foi abandonado:** a classe `[̀-ͯ]` para tirar acentos (gravada como caracteres
  combinantes literais), trocada por `\p{M}` com a flag `u`; a busca "s" na prova de C18
  ("Pinheiros" também contém "s" e o critério é "contém"), trocada por "sa"; asserções ancoradas no
  `<p>` de ajuda do DateField (o glifo "error" do ícone entra no texto), que passaram a mirar o
  `<span>` da mensagem.

### Lote B (S4–S7)

- **Onde o lote fechou:** C36–C58 verdes; as 25 provas rodaram isoladas com o comando do checklist
  (≥ 1 teste cada; o `-t "Section"` de C57 roda 9), e as 38 do lote A seguem verdes.
  `npm run verify` verde (10/10 tarefas, 951 testes). Estado: working tree sobre `6581690`, sem
  commit.
  Criados `organisms/FilterBar/*` (com `data/`), `organisms/List/*` (com `List.context.ts` e
  `data/`; `ListSection` sai do mesmo `List.tsx`) e `organisms/Section/*`; alterados
  `src/styles.css`, `src/styles.spec.ts`, `src/figma-links.spec.ts` (Section entra em `NODES`) e
  `packages/docs/figma-components.md`; linha 31 em `.tasks/lamb-notas-para-o-designer.md`, como
  pede o Unresolved 1. Dois nomes novos no `styles.css`: `--animate-skeleton-pulse` no `@theme`
  (o `animate-pulse` do Tailwind é 2s com outra curva) e `@utility no-scrollbar`. Leituras para o
  verificador: o foco volta ao botão Filtros por um efeito do FilterBar que roda depois da
  restauração do `useModalLayer` (cobre o painel aberto pelo corpo de um chip); 309px da Section é
  `max-w-77.25` da escala de espaçamento; o `console.error` "window.scrollTo" do `npm run verify`
  vem de `NavItem.spec.tsx` (motion), anterior ao lote. Nenhuma linha de Landing nova: nada aqui
  é difícil de reverter.
- **O que o usuário decidiu no meio:** nada.
- **O que foi abandonado:** o `scrollbar-none` do Tailwind, que existe no 4.3 de `packages/ui`
  (onde o `styles.spec.ts` compila) mas não no 4.2 que o `@tailwindcss/postcss` usa no Storybook e
  nos apps, trocado por `@utility no-scrollbar`; `typeof … === 'function'` na prova de C56 (o
  DateField é um `forwardRef`, objeto), trocado por `toBeDefined()`, a forma do lote 2; o
  `isValidElement` como guarda de `empty` (não estreita o ramo de props), trocado por um guarda
  próprio; notas longas na tabela do `figma-components.md`, que fariam o Prettier realinhar a
  tabela inteira.

### Correções do round 1

Lacunas dos achados 1, 2, 3, 6, 7, 8 e 11 do Verifier. Só testes mudaram; nenhum código de produto.
Os mutantes foram aplicados nos arquivos reais, com `.bak` tirado antes, e restaurados (`cmp` igual, confirmado pelo Verifier no round 2); `verify.md` pede worktree separada.

1. **C4.** O `presentation is fixed while open (C4)` do Select agora força um `rerender` com
   `helperText` novo depois da troca do `matchMedia`, nos dois sentidos (popover continua popover;
   sheet continua sheet) e reabre com a largura nova. Novo `panel presentation is fixed while open
(C4)` no FilterBar: Drawer continua Drawer e BottomSheet continua BottomSheet num `rerender`
   com `resultCount` novo; a reabertura troca. Prova nova sob C4. Um mutante que decide a
   apresentação no render falha os dois testes; o teste antigo do Select passaria.
2. **C1.** Novo `auto presentation (C1)` no DateField: larga → popover; estreita → sheet;
   `desktop` em tela estreita → popover; `mobile` em tela larga → sheet. O C43 não cobria
   `desktop` em tela estreita, então entrou `panel auto presentation (C1)` no FilterBar
   (larga/`desktop` → Drawer `w-drawer`; estreita/`mobile` → BottomSheet `h-1/2`). Duas provas
   novas sob C1.
3. **C20.** O sheet do Select também fecha pelo fundo (`.bg-scrim`): nada escolhido (`onChange`
   1x, o valor anterior continua) e o foco volta ao gatilho.
4. **C31.** `max` passa a `2026-03-28`: dia 29 `aria-disabled` com "Depois de 28/03/2026, a
   última data permitida", e o dia 28 habilitado. O motivo de `min` é afirmado no nome. A
   célula do dia de `value` tem `aria-selected="true"`, e um caso controlado
   (`value="2026-03-10"`) foca e seleciona o dia 10. Um mutante sem `max={max}` falha.
5. **C39.** Com busca, Filtros e contador: o `<p>` está na linha de cima, é o último filho dela
   e tem `panel:not-in-data-[viewport=mobile]:ml-auto` e `in-data-[viewport=desktop]:ml-auto`.
6. **C50.** O `innerHTML` da List é igual ao de `<EmptyState size="small" variant="inline">`
   com as mesmas props, e difere do `medium` e do `page`. O `{...empty}` depois dos padrões ficou
   como estava.
7. **CSS compilado.** Em `styles.spec.ts`, `List section spacing (C47)` prova duas coisas.
   `[data-list-section] + .…:mt-2` vale 8px e não está em media query. No jsdom, o seletor só
   casa a seção que segue outra. `Select focus ring (C7)` prova que o prefixo
   `has-[[role=combobox]:focus-visible]:` gera `:has(…)` com `outline-width` 2px, `outline-offset` 2px e
   `outline-color` `#27272F`. Prova também o anel aberto: `border-color` `#27272F`, `ring-1` =
   `0 0 0 calc(1px + …)`, `--tw-ring-color` `#27272F`. O C7 do Select afirma as três classes
   literais na caixa. Provas novas sob C7 e C47.

- **Formatação:** o `prettier --write` deste arquivo só realinhou as colunas da tabela do
  Landing; as duas linhas adicionadas depois do Verifier estavam fora do alinhamento. O texto não
  mudou.
- **Abandonado:** `ruleFor` nas variantes arbitrárias, que não escapa `+`, `&` nem `(`. Foi
  trocado por uma busca pelo seletor sem escape. O `toBe('#27272f')` em caixa baixa também saiu,
  porque o token resolve em caixa alta.
