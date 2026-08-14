# Alinhar o `@church/ui` ao design system Lamb

> Build this with **tlc-implement**.
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

O `@church/ui` foi construído a partir de nós do Figma lidos um a um, sem a camada que o designer
publicou depois no artefato "Lamb" (atualizado em 2026-10-05). Os 19 componentes existentes divergem
dele em três frentes:

- **Cores:** usam a paleta crua (`neutral-67`, `green-67`…) em vez dos tokens semânticos. Com isso,
  repetem os contrastes que o designer corrigiu:
  - helper em neutral-67 (3,2:1);
  - Button e Toast positivos em green-67 (3,8:1);
  - Toast de atenção com texto branco sobre yellow-50.
- **Fonte e foco:** a fonte é Noto Sans, e não Inter. Não há anel de foco único: em quase todos os
  átomos, o foco é o do browser.
- **Defeitos visíveis:**
  - o Avatar referencia tokens inexistentes e fica sem fundo;
  - uma folha do NavItem que perde o foco passa a parecer ativa;
  - a story do SearchField desenha o ícone de limpar em 20px em todos os tamanhos.

Quem paga é o backoffice que vai nascer sobre esses componentes: cada tela herdaria contraste abaixo
de WCAG AA e um visual diferente do que o designer entrega. O source não traz números de impacto.

Com a mudança, `@church/ui` passa a expor:

- a camada semântica do Lamb como utilitários Tailwind (`text-primary`, `bg-surface`,
  `border-control`…);
- as 16 sombras de elevação;
- a fonte Inter.

Os 19 componentes existentes passam a reproduzir os valores, estados, padrões, acessibilidade e
comportamento do Lamb. A **API atual fica**: nomes e valores literais das props seguem a convenção do
repositório, e só entram props ou valores que o design acrescenta sem equivalente aqui. O design é
binding (ver Sources). O Storybook é a tela de todo critério.

44 critérios em 6 slices · 11 one-way doors · 5 open, 0 block. **Task grande:** ver as costuras em
"Out of scope → Como cortar".

## Criteria

### Fundação: tokens, fonte, foco e movimento

1. Dado `@church/ui/styles.css` carregado, quando um elemento usa o utilitário semântico, então a
   cor computada é a da tabela abaixo em `data-theme` ausente/light e em `data-theme="dark"`
   (valores resolvidos de `tokens.json`).

   | Utilitário | Light | Dark |
   | --- | --- | --- |
   | `text-primary` | #27272F | #FFFFFF |
   | `text-secondary` | #686F7A | #C1C8D3 |
   | `text-disabled` | #A3ACBD | #868F9D |
   | `text-inverse` | #FFFFFF | #27272F |
   | `text-link` | #2558A1 | #84B7FF |
   | `text-danger` | #AA2511 | #F99D8F |
   | `text-positive` | #1F7534 | #5BD279 |
   | `text-attention` | #5B4801 | #FFDF6D |
   | `text-accent` | #3175D4 | #4994FF |
   | `text-on-accent` / `text-on-positive` / `text-on-danger` | #FFFFFF | #27272F |
   | `text-on-attention` | #27272F | #FFFFFF |
   | `bg-page` | #F0F0F2 | #101015 |
   | `bg-surface` | #FEFEFE | #27272F |
   | `bg-hover` / `bg-selected` | #A2ACBD1A / #A2ACBD33 | idem |
   | `bg-disabled` | #DEE1E8 | #474B53 |
   | `bg-action-primary` | #27272F | #FFFFFF |
   | `bg-accent-solid` | #3175D4 | #4994FF |
   | `bg-positive-solid` | #1F7534 | #5BD279 |
   | `bg-danger-solid` | #E03116 | #F56752 |
   | `bg-attention-solid` | #F4BF01 | #886A01 |
   | `bg-accent-subtle` / `bg-positive-subtle` / `bg-danger-subtle` / `bg-attention-subtle` | #3388FF1A / #16CA441A / #FF4E331A / #FFC9001A | idem |
   | `bg-scrim` | #27272F99 | idem |
   | `border-default` | #DEE1E8 | #474B53 |
   | `border-control` | #868F9D | #A3ACBD |
   | `outline-focus-ring` | #27272F | #FFFFFF |
   | `text-brand-red` / `-blue` / `-teal` (e `fill-`) | #EF2F29 / #3255AE / #46C0A3 | idem |
2. Quando um elemento usa `shadow-elevation-<conjunto>-<direção>`, então o `box-shadow` é o
   literal de `tokens.json` para os 16 estilos. Exemplos:
   - `shadow-elevation-high-bottom` = `0px 12px 40px 0 #0000001F`;
   - `shadow-elevation-deep-high-bottom` = `0px 24px 48px 0 #0000003D`;
   - `shadow-elevation-low-bottom-12` = `0px 8px 12px 0 #00000014`.
3. Sempre:
   - texto não-Display renderiza em `Inter`, em `apps/web` e no Storybook;
   - Display continua em `Oswald` 700;
   - nenhum arquivo referencia `Noto Sans` ou `--font-noto-sans`.
4. Quando um elemento focável de um componente do `@church/ui` recebe foco por teclado
   (`:focus-visible`), então mostra `outline` 2px sólido `focus-ring` com `outline-offset` 2px. Com
   foco por clique (sem `:focus-visible`), nenhum outline aparece. Os campos da base seguem o
   critério 22.
5. Enquanto `prefers-reduced-motion: reduce` estiver ativo, nenhuma transição ou animação de
   componente do `@church/ui` dura mais que 0,01ms. Isso inclui as de `motion` no NavItem.
6. Sempre: um controle `disabled` do `@church/ui` tem `cursor: not-allowed`.

### Ações e exibição

7. Quando `Button` renderiza nos tamanhos `small`, `medium` e `large`, então mede 32, 48 e 56 de
   altura fixa, com:
   - padding 8/12, 12/16 e 14/20;
   - raio 8, 12 e 16;
   - tipografia 500 14/16, 16/24 e 18/28;
   - ícones 16, 20 e 24.

   O gap é 8 e o `type` padrão é `"button"`. Em `small`, a área clicável se estende a 44px de
   altura (6px acima e abaixo).
8. Quando `Button` renderiza em cada combinação de `variant` × `color`, então fundo, texto e hover
   são estes. `:active` é igual ao hover e a transição é de `background-color` em 150ms ease-out.
   - `filled` + `neutral`: `neutral-999` sobre `neutral-00`, hover `neutral-100`.
   - `filled` + `accent` (valor novo de `color`): `accent-solid` + `on-accent`, hover `blue-83`.
   - `filled` + `positive`: `positive-solid` (green-83) + `on-positive`, hover `green-100`.
   - `filled` + `destructive`: `danger-solid` + `on-danger`, hover `red-83`.
   - `ghost`: fundo `{neutral|blue|green|red}-alpha/10`, hover `/20`, com texto por cor:
     `text-primary`, `blue-83`, `green-83` e `red-83`.
   - `transparent`: fundo transparente, hover `{cor}-alpha/10`, texto como no `ghost`.
   - Disabled: `filled` e `ghost` usam `bg-disabled` + `text-disabled`; `transparent` usa só
     `text-disabled`.
9. Quando `IconButton` renderiza, então:
   - é quadrado de 32, 48 e 56 (`small`, `medium` e `large`), com ícone de 16, 20 e 24;
   - segue a mesma matriz de cor, hover, pressed e disabled do critério 8 para seu `variant` ×
     `color`;
   - em `small`, a área clicável se estende a 44px de altura (6px acima e abaixo);
   - `aria-label` continua obrigatório no tipo.
10. Quando `Badge` renderiza com `variant="high"`, então o fundo é `{cor}-83` com texto
    `on-accent`. Para `color="neutral"`, o fundo é `bg-action-primary` com `text-inverse`, sem
    borda.

    Com `variant="low"`, segue o critério 11. Os padrões passam a ser `variant="low"`,
    `size="small"` e `color="neutral"`, e o elemento é `<span>` inline-flex sem quebra.
11. Quando `Tag` renderiza, então:
    - o fundo é `{cor}-alpha/10` e o texto `{cor}-100`, para as 11 cores;
    - `small`, `medium` e `large` medem 20, 24 e 32, com padding 2/4, 4/6 e 4/6, raio 6, 8 e 10,
      gap 4 e ícones 14, 16 e 20;
    - os padrões passam a ser `color="blue"` e `size="small"`, e o elemento é `<span>` inline-flex
      sem quebra.
12. Quando `Avatar` renderiza, então:
    - **Tamanhos:** `xSmall`, `small`, `medium`, `large` e `xLarge` medem 24, 32, 48, 56 e 80, com
      padrão `small`.
    - **Cores:** fundo `neutral-17`, iniciais `neutral-100` 600, contorno `inset` de 1px
      `border-default`.
    - **Iniciais:** primeira e última palavra do `alt`, no máximo 2. Por exemplo, "Fulano de Tal
      Teste" vira "FT".
    - **Atributos:** `className` e os demais atributos vão para o wrapper.
13. Se a imagem do `Avatar` falhar ao carregar (`onError`), então o Avatar mostra as iniciais no
    lugar da foto.
14. Sempre: o wrapper do `Avatar` tem `role="img"` e `aria-label` = `alt`, e a `<img>` interna tem
    `alt=""`.
15. Quando `Icon` recebe:
    - `people_alt`, `remove_red_eye`, `warning_amber`, `insert_chart_outlined` ou `error_outline`,
      então renderiza `group`, `visibility`, `warning`, `bar_chart` e `error`;
    - `expand_more` ou `expand_less`, então continua funcionando;
    - `label` (prop nova), então o ícone tem `role="img"` e `aria-label`;
    - nenhum `label`, então é `aria-hidden="true"`, e nenhuma prop repassada desfaz isso.
16. Quando `Tooltip` renderiza, então:
    - fundo `neutral-999` e texto `text-inverse`;
    - padding 4/8, raio 8, sem seta e sem quebra de linha;
    - sombra `elevation-high-bottom` e distância 8 do gatilho;
    - tipografia 500 14/20 no `size="medium"` (prop nova, padrão) ou 18/28 no `size="large"`;
    - aparece e some em 120ms ease-out;
    - `placement` mantém `top | bottom | left | right`.
17. Enquanto o `Tooltip` está aberto, `Esc` o fecha mesmo com o foco fora do gatilho. O
    `aria-describedby` do gatilho mantém os ids que já tinha e acrescenta o do tooltip.
18. Quando `Typography` renderiza, então:
    - `d3` passa a 24/30 (display-small);
    - existe uma variante para body-large, Inter 400 18/28 (nome em Unresolved 1);
    - as demais variantes mantêm os valores atuais, que já batem com o Lamb.
19. Quando `Checkbox` renderiza:
    - **Elemento:** é um `<input type="checkbox">` nativo dentro de `<label>`, com `checked`,
      `indeterminate`, `onCheckedChange`, `helperText`, `state` e `size` inalterados.
    - **Tamanhos:** caixas de 16, 24 e 32, raio 6, 8 e 10, glifo 14, 20 e 26 (`check`, ou `remove`
      quando indeterminado).
    - **Vazio:** borda 2px `border-control` sobre `bg-surface`; no hover, borda `neutral-83` e fundo
      `bg-hover`.
    - **Marcado:** `neutral-999` com glifo `neutral-00`.
    - **Erro e sucesso:** `state="error"` usa `danger-solid`; `state="success"` usa
      `positive-solid`.
    - **Disabled:** borda `neutral-33`, fundo `bg-disabled`, glifo e rótulo `text-disabled`.
    - **Rótulo:** 500 `text-primary` em 14/16, 16/24 e 18/32.
    - **Transição:** 250ms.
20. Quando `Checkbox` recebe `helperText`, então:
    - o texto fica ligado por `aria-describedby`;
    - `state="error"` marca `aria-invalid="true"`;
    - clicar em qualquer ponto do rótulo alterna o estado.

### Formulários

21. Quando um campo da base (`TextField`, `TextArea`, `SearchField`, campo de salto do Paginator)
    está em repouso, então:
    - borda 1px `border-control` sobre `bg-surface`;
    - valor `text-primary` e placeholder `text-secondary`;
    - ícones em `text-secondary`, de 16, 20 e 24 (`small`, `medium` e `large`);
    - altura 32, 48 e 56, padding 6/12, 12/14 e 14/18, raio 8, 12 e 16.
22. Quando o campo recebe hover, então a borda vira `neutral-83`. Quando recebe foco
    (`:focus-within`), a borda vira `focus-ring` com sombra de 1px da mesma cor (2px no total). A
    transição de `border-color` e `box-shadow` dura 150ms.
23. Quando o campo tem `state="error"`, então:
    - borda e sombra de 1px `danger-solid`, com `aria-invalid="true"`;
    - o helper mostra ícone `error` preenchido de 16px e o texto em `text-danger`;
    - nenhum ícone de erro aparece dentro do campo.

    Com `state="success"`, a borda é 1px `positive-solid` e o helper mostra `check_circle` em
    `text-positive`.
24. Quando o campo está `disabled`, então:
    - fundo `bg-hover` e borda `border-default`;
    - valor e placeholder `text-disabled`;
    - cursor `not-allowed`.
25. Quando o campo tem `label`, então:
    - o rótulo é 400 `text-primary` (16/24, ou 12/16 no `small`);
    - o gap rótulo→campo→helper é 8, 6 e 4 (`large`, `medium` e `small`);
    - com `optional={false}` (padrão atual), aparece um `*` irmão do label, com
      `aria-hidden="true"` e `text-danger`, e o input recebe `aria-required="true"`;
    - com `optional`, aparece "(Opcional)" à direita, em `text-secondary` 14px.
26. Quando há `helperText`, então ele aparece como `<p>` 14/20 (12/16 no `small`) em
    `text-secondary`, ligado por `aria-describedby`.
27. Quando o `TextField` é `type="password"`, então:
    - o botão alterna entre "Mostrar senha" e "Ocultar senha" (`aria-pressed`);
    - o ícone é `visibility` com a senha oculta e `visibility_off` com ela visível;
    - nenhum cadeado é desenhado.
28. Sempre: o `id` do input vem de `useId`, inclusive no modo RHF. Dois campos com o mesmo `name` na
    mesma página não compartilham `id`.
29. Quando o `TextArea` tem `maxLength`, então:
    - o contador aparece abaixo do campo, alinhado à direita, em 12/16 `text-secondary`;
    - o contador tem `aria-live="polite"`, entra no `aria-describedby` e lê "N caracteres".

    O campo tem `rows` 4, `resize: vertical` e tipografia 18/28.
30. Quando o `SearchField` renderiza, então:
    - **Estrutura:** o wrapper tem `role="search"`. Sem `label`, o input tem `aria-label` "Buscar".
      O placeholder padrão é "Buscar".
    - **Teclado:** `Enter` chama `onSearch(valor)`, e `Esc` limpa o campo e chama `onClear()`
      (props novas).
    - **Botão de limpar:** só existe um, rotulado "Limpar busca" nos dois modos (com e sem RHF),
      ausente quando vazio ou `disabled`. O "x" nativo do browser não aparece. O ícone tem 16, 20 e
      24 conforme o `size`.

### Navegação

31. Quando o `NavItem` renderiza a partir de `lg`, então:
    - altura mínima 32, padding 6/10, raio 8, tipografia 500 14/16 e ícone 20;
    - inativo: texto e ícone `text-secondary`;
    - hover: fundo `bg-hover` e `text-primary`.

    Abaixo de `lg`, mede 48, com padding 12/14, raio 12, tipografia 16/24 e ícone 24.
32. Quando o `NavItem` está:
    - `activated`, então tem fundo `bg-selected`, `text-primary`, ícone preenchido e
      `aria-current="page"`;
    - `selected` (prop nova: pai na trilha), então tem ícone preenchido e `text-primary`, sem fundo
      e sem `aria-current`.

    Perder o foco não ativa nem desativa o item.
33. Quando um `NavItem` com `subItems` é expandido, então:
    - `aria-expanded="true"` e `aria-controls` apontando para a sublista, sem `aria-haspopup`;
    - o chevron `keyboard_arrow_down` de 20px gira 180° em 200ms;
    - expandir não preenche o ícone.

    Cada sub-item tem padding esquerdo 38 e um ponto de 4px a 19px da borda, sempre visível, sem
    linha-guia vertical.
34. Quando o `NavItem` está `collapsed`, então mostra só o ícone, com 32 de largura. `aria-label` e
    `title` recebem o `label`, que não aparece fora do modo colapsado.

### Dados

35. Quando a `Cell` renderiza, então:
    - **`type="default"`:** rótulo 500 14/16 `text-primary` e parágrafo 400 12/16 `text-secondary`,
      com gap 2;
    - **`heading`:** rótulo 500 12/16 `text-secondary`;
    - **`icon` (prop nova):** desenha um ícone de 20 antes do texto;
    - **`type="avatar"` (valor novo):** desenha `Avatar size="small"` e o texto;
    - **ações:** são `IconButton variant="transparent" color="neutral" size="small"`.
36. Quando a `Table` renderiza:
    - **Cabeçalho:** a linha tem borda inferior 1px `border-default` e fundo `bg-surface`.
    - **Densidade:** as linhas medem 48, 40 e 32 de altura com `density` `default`, `compact` e
      `dense` (prop nova).
    - **Estados de linha:** hover `bg-hover`; a linha selecionada tem `aria-selected="true"` e
      `bg-selected`.
    - **Colunas:** a coluna de seleção tem 40 de largura. Colunas com `align="right"` (nova) usam
      `tabular-nums`.
    - **`caption`:** é visível por padrão, e `captionHidden` (nova) a esconde.
37. Quando o usuário ativa o botão de ordenação de uma coluna `sortable`, então
    `onSortChange(columnId, direction)` (nova) recebe a próxima direção:
    - de `none`, vai para `ascending`;
    - de `ascending`, vai para `descending`;
    - de `descending`, volta para `ascending`.

    O ícone de 16px é `unfold_more`, `arrow_upward` ou `arrow_downward`, e `aria-sort` reflete
    `sortDirection`.
38. Quando a seleção está ligada, então:
    - o checkbox de cada linha se chama "Selecionar {texto da 1ª coluna}";
    - o do cabeçalho se chama "Selecionar todos";
    - `selectable` passa a ter padrão `false`.

    Sem linhas, o estado vazio tem padding 40/16 em `text-secondary`.
39. Quando o `Paginator` renderiza, então:
    - **Raiz:** gap 24, `flex-wrap`, 400 12/16 `text-secondary`.
    - **Intervalo:** formatado em pt-BR (por exemplo "1-10 de 1.284 itens"), em
      `aria-live="polite"`.
    - **Opções de tamanho:** `pageSizeOptions` passa a ter padrão `[10, 25, 50, 100]`.
    - **Botões de página:** 32 de altura, padding 0/8, 500 14/16 `text-primary`; a página atual tem
      borda `neutral-999`.
    - **Botões de navegação:** fundo `neutral-alpha/10`, hover `/20` e ícone 18; quando
      desabilitados, ficam `text-disabled` sem fundo.
    - **Select de tamanho:** borda `border-control` e texto `text-primary`.
    - **`nav`:** usa `label` (prop nova), com padrão "Paginação".
40. Se `totalItems` é 0, então o `Paginator` mostra "0-0 de 0 itens" e a página 1.

### Feedback

41. Quando um toast é disparado, então tem:
    - **Cor por variante:** `success` usa `bg-positive-solid` + `on-positive`, `error` usa
      `bg-danger-solid` + `on-danger` e `warning` usa `bg-attention-solid` + `on-attention` (texto
      escuro no light) e `info` usa `bg-action-primary` + `text-inverse`.
    - **Caixa:** raio 10, padding 12, largura máxima 320, sem altura mínima, gap 8 entre título,
      corpo e ação, e sombra `elevation-high-bottom`.
    - **Título:** 600 14/20.
    - **Corpo:** o `<p>` de descrição só existe com conteúdo.
    - **Fechar:** botão de 32×32, raio 8, ícone 20, rótulo "Fechar notificação" e
      `type="button"`.
42. Quando toasts são exibidos, então:
    - **Posição:** ficam no canto inferior direito, a 24px das bordas, empilhados com gap 8.
    - **Acessibilidade:** a região tem `aria-label="Notificações"`. `error` tem `role="alert"`, e
      `success`, `warning` e `info` têm `role="status"`.
    - **Tempo:** o fechamento automático ocorre em 6000ms e pausa com hover ou foco dentro do
      toast.
43. Quando a ação do toast é um `Button`, então a story a mostra com 32 de altura, padding 8/12,
    raio 8, fundo `neutral-999` e texto `neutral-00`.
44. Sempre: o `parameters.design` de cada story modificada aponta para o nó do Figma listado em
    Sources, e `packages/docs/figma-components.md` traz os mesmos nós e o mapeamento dos tokens
    semânticos.

## Out of scope

- **Os 28 componentes do Lamb que o repositório não tem** (o usuário pediu "apenas os que já
  existem"):
  - Alert, AvatarGroup, AvatarContent, BottomSheet, Breadcrumb, Chip, CountBadge;
  - DateField, DatePicker, Dialog, Divider, Drawer, EmptyState, FilterBar, FilterChip;
  - List, ListItem, Logo, MenuDrawer, MenuDropdown, NavigationBar;
  - Page, PageHeader, Progress, Radio, RadioGroup, Section, Select, SideMenu;
  - Stack, StatCard, Toggle, Upload.
- **Props que dependem dos componentes acima:** `count` no NavItem, `Cell type="avatarGroup"`, e
  cabeçalho, logo, rodapé e Profile da navegação.
- **Renomear prop ou valor literal para o nome do Lamb:** por exemplo `status`, `high/low/flat`,
  `sm/md/lg`, `hint`, `Pagination`, `total`. Por decisão do usuário, a convenção do repositório
  fica.
- **Tokens consumidos só por componentes novos:** `drawer` 650, `content-max` 1440, breakpoint 960,
  `sidebar` 240/64, densidades Painel/App.
- **`apps/native`:** nativewind com Tailwind 3; não consome `@church/ui`.
- **Figma Code Connect e seletor de tema na UI.**

**Como cortar, se for dividir.** A única ordem obrigatória é esta:

1. **Fundação** (1–6) vem antes de tudo, porque os critérios dos componentes nomeiam utilitários
   que só existem depois dela.
2. **Ações e exibição** (7–20) vem em seguida, porque Button, IconButton, Checkbox, Badge, Avatar e
   Icon são usados pelos demais.
3. **Formulários** (21–30), **Navegação** (31–34) e **Feedback** (41–43) são independentes entre
   si.
4. **Dados** (35–40) vem por último.

O critério 44 acompanha cada slice. O repositório não declara tamanho de task e o `gh issue list`
não retornou issues. O histórico só informa tamanho de PR (14 a 30 arquivos por commit de
componente, 22 no PR #5), o que sugere 1 PR por slice.

## Observable

As telas são as stories do Storybook de cada componente.

| Surface | Decision | Landing |
| --- | --- | --- |
| story `Table` | estado vazio | 38 |
| story `Table` | loading e error | existing - `state` + `loadingContent`/`errorContent` |
| story `Table` | densidade, ordenação e seleção | 36, 37, 38 |
| story `Table` | ação destrutiva confirma | n/a - a confirmação é do app (README Button do Lamb) |
| story `Paginator` | vazio (`totalItems` 0) | 40 |
| story `Avatar` | sem foto / foto quebrada | 12, 13 |
| stories de campo | erro, sucesso, disabled, vazio | 23, 24, 30 |
| stories de campo | não autorizado | n/a - o design system não conhece permissão |
| story `Checkbox` | erro, sucesso, disabled, indeterminado | 19, 20 |
| story `Button` / `IconButton` | disabled e pressed | 8, 9 |
| story `NavItem` | colapsado, ativo, trilha | 32, 34 |
| story `Toast` | variante `info` | 41 |
| story `Toast` | ordem de empilhamento | 42 |
| story `Tooltip` | fechar por teclado | 17 |
| todas as stories | tema dark | 1 |
| copy | rótulos pt-BR ("Mostrar senha", "Limpar busca", "Selecionar todos", "Notificações", "Buscar") | 27, 30, 38, 42 |
| doc `packages/docs/figma-components.md` | nós e mapeamento | 44 |

## Swept

- validation: 40 (`totalItems` 0); salto de página: existing - limiar de 6 páginas e validação de `.tasks/paginator.md`, mantidos por decisão do usuário
- failure modes: 13 (falha da foto do Avatar)
- idempotency and retry: n/a - componentes de apresentação, sem efeito colateral próprio
- authorization: n/a - o design system não conhece permissão; "Estado, dados, rotas e permissões são do app" (README Lamb)
- concurrency and ordering: 42 (empilhamento); a ordem de chegada é existing - react-toastify com `newestOnTop` padrão
- data lifecycle: n/a - nada é persistido
- external-dependency failure: 13 (imagem remota do Avatar). Fontes: existing - `next/font` faz self-host no build e o Material Symbols vem do pacote `material-symbols`
- state transitions: 32 e 33 (NavItem), 37 (ciclo de ordenação), 19 (indeterminado)
- observability: n/a - biblioteca de UI sem canal de diagnóstico; `aria-label` obrigatório no `IconButton` é garantido por tipo (9)

## Impact

| Front | What changes |
|---|---|
| domain | Nenhum nome de prop nem valor literal existente muda. Props e valores novos: `Button color="accent"`, `Icon label`, `Tooltip size`, `NavItem selected`, `SearchField onSearch/onClear`, `Cell icon` e `type="avatar"`, `Table density/captionHidden/onSortChange` e `align` na coluna, `Paginator label` |
| domain | Padrões que mudam de valor: `Badge` `variant` high→low e `size` medium→small; `Tag` `color` neutral→blue e `size` medium→small; `Avatar` padrão medium→small; `Table` `selectable` true→false e `caption` de sr-only→visível; `Paginator` `pageSizeOptions` [10,20,50]→[10,25,50,100]; `Toast` `autoClose` 5000→6000 e posição top-right→bottom-right. Quem depende hoje: só stories e specs, porque `apps/web` consome apenas Button, Icon e Toast (`apps/web/app/page.tsx`, `layout.tsx`) |
| domain | `Avatar`: os nomes de tamanho mudam de medida: `small` 24→32, `medium` 36→48, `large` 64→56, e surge `xSmall` 24. Quem ramifica: só a pasta do Avatar |
| domain | `Paginator`: o campo de salto (a partir de 6 páginas, com validação) e a volta à página 1 na troca de tamanho não mudam (decisão do usuário) |
| stored data | nothing to migrate |
| tests | Sem spec hoje, e o Princípio I exige ao modificar: IconButton, Badge, Tooltip, Typography, Field, TextField, TextArea, NavItem e Navigation. Mudam: `Toast.spec.tsx:138` (classes), `Paginator.spec.tsx` (C3, C4, C13–C15), `Table.spec.tsx`, `Cell.spec.tsx` e `SearchField.spec.tsx:36-52` (falso positivo do ícone de limpar) |
| docs | `packages/docs/figma-components.md` e `color-system.md` |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| A API existente fica; o design governa o resto | Nome e valores literais das props seguem a convenção do repositório (`models/`, `atoms/data`, `ComponentWithIconProps`, `slotProps`, RHF, variantes do react-toastify). Visual, estados, padrões, a11y e comportamento seguem o Lamb; props sem equivalente no repositório entram com o nome do Lamb, nos literais da convenção (`size: 'medium' \| 'large'` no Tooltip, não `md \| lg`) | Adotar o vocabulário do `index.d.ts` do Lamb (decisão do usuário: "props que parecem ter sido feitas por conta de convenção não devem ser tocadas") |
| `IconButton` fica | Componente próprio, com a matriz visual do Button do Lamb (critério 9) | `Button iconOnly` do Lamb (decisão do usuário) |
| Utilitários semânticos com o nome do Lamb | Em `packages/ui/src/styles.css`, `@theme` declara `--text-color-<nome>`, `--background-color-<nome>` e `--border-color-<nome>` (namespaces verificados no Tailwind 4.3.3 de `packages/ui`), **depois** de `--text-*: initial`. O dark fica no bloco `[data-theme='dark']` existente, e `focus-ring` em `--color-focus-ring` | `--color-text-primary` gera `text-text-primary` e `bg-bg-page`, nomes que não batem com tokens.json nem com o README do designer |
| Tokens semânticos nascem em `@church/tokens` | `packages/tokens/src/semantic.ts` (referência à primitiva por tema + superfícies), gerado em `root.css` como hoje | Valores só no CSS do `ui` criam uma segunda fonte de cor fora do pacote de tokens |
| Escala de raio fica a do Tailwind | Mapeamento documentado: Lamb `2xs` 4 = `rounded-sm`, `xs` 6 = `rounded-md`, `sm` 8 = `rounded-lg`, `md` 10 = `rounded-10`, `lg` 12 = `rounded-xl`, `xl` 16 = `rounded-2xl`, `2xl` 24 = `rounded-3xl` | Sobrescrever `--radius-*` com os nomes do Lamb muda em silêncio todo `rounded-lg` já escrito (8→12) |
| Sombras | `--shadow-elevation-<conjunto>-<direção>` com os 16 literais de tokens.json | — (forçado: não há sombra hoje) |
| Fonte | `Inter` via `next/font/google` em `apps/web/app/layout.tsx` e `.storybook/decorators.tsx`, variável `--font-inter`, com `--font-sans: var(--font-inter)` | Manter Noto Sans contraria o README Lamb ("Inter para todo o resto") |
| Ícones de 14, 18 e 26px | `packages/tokens/src/icon.ts` ganha `14`, `18` e `26` (Badge/Tag, paginação, Checkbox `large`); o `size` nomeado do `Icon` não muda | Arredondar para 16/20/24 perde fidelidade ao `bundle.css` |
| Toast continua sobre react-toastify | `toast.success/error/warning/info(...)` + `ToastContainer`, com posição, região e roles do critério 42 | `ToastRegion` declarativo do Lamb troca uma dependência adotada pela constituição (Princípio IV) e o contrato do app |
| Checkbox nativo | `<input type="checkbox">` dentro de `<label>`, com as props atuais | Radix `button role=checkbox` não dá rótulo inteiro clicável nem `aria-describedby` como o Lamb especifica |
| Precedência dentro do artefato | (a) A regra global de a11y do README vence o CSS que a viola. (b) O token declarado vence a aritmética do CSS (campo 48/56, não 50/58). (c) No resto, o `bundle.css` vence a prosa do README | Escolher caso a caso durante o build esconde a decisão; ver `.tasks/lamb-notas-para-o-designer.md` |

## Sources

- https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb - "Lamb", design system do designer, última
  alteração em 2026-10-05. É **binding para a interface**:
  - `project/tokens.json`: cores, tipografia, sombra, raio e tamanho;
  - `project/README.md`: regras globais e ajustes de acessibilidade;
  - `project/components/bundle.css`: valores;
  - `project/components/<Nome>/README.md`: regras por componente.

  Os valores que os critérios usam estão transcritos aqui. O `index.d.ts` não é binding para nomes
  de props (Decided).
- Nós do Figma citados pelo artefato (critério 44):

  | Componente | Nó(s) |
  | --- | --- |
  | Button | 12968:2661 |
  | IconButton | 13465:1130 |
  | Badge | 13803:5494 |
  | Tag | 13596:406 |
  | Checkbox | 13628:1215, 13628:1586 |
  | TextField | 13607:2966 |
  | TextArea | 13607:3107 |
  | SearchField | 13607:3072 |
  | NavItem | 12966:3837, 13506:10602 |
  | Navigation | 12967:3606 |
  | Table | 13616:5097 |
  | Cell | 13615:5291 |
  | Paginator | 13607:2572 |
  | Toast | 13805:425 |
- Conversa de 2026-10-07: a resposta do usuário fecha escopo e API:

  > "O IconButton deve ser mantido." · "1 - sim, apenas os que já existem." · "2 - sim, vai pelo
  > que está no design, mas o IconButton pode deixar, props que parecem ter sido feitas por conta
  > de convenção não devem ser tocadas."

  E, sobre o padrão do Button (fica `filled` + `neutral` + `medium`), o comportamento do Paginator
  (fica o atual) e a cor do Toast `info` (`bg-action-primary` + `text-inverse`):

  > "Certo pode ser isso que você falou sobre o toast. do 1 a 3 está correto."
- `.tasks/paginator.md`: decisão anterior do Paginator; vale contra o Lamb no campo de salto e na
  volta à página 1.
- `.tasks/lamb-notas-para-o-designer.md`: inconsistências internas do artefato.

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | open | Nome da variante body-large na `Typography`, cujas variantes `p1`–`p3` são 16, 14 e 12. | Assumido: `p0`. |
| 2 | open | Iniciais do Avatar `xSmall` em 10px (bundle.css) violam o mínimo de 12px do README. Qual vale? | Assumido: 12px, pela precedência (a); levar ao designer. |
| 3 | open | Breakpoint do NavItem: `lg` (1024, atual) ou 960 (Lamb)? | Assumido: `lg`; o 960 entra com o SideMenu/Page. |
| 4 | open | Qual arquivo do Figma é a fonte atual? As stories apontam nós do arquivo `7I9GnO3cTPpaJPOUfFsI9t`, e o artefato cita outros nós para Toast, NavItem e campos. | Assumido: os nós de Sources no mesmo arquivo; validar se abrem. |
| 5 | open | Inconsistências restantes do artefato (`.tasks/lamb-notas-para-o-designer.md`) | Resolvidas pela precedência de Decided; nenhuma muda critério além das listadas aqui. |
