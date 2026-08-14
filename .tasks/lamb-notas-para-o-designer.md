# Lamb: inconsistências internas para levar ao designer

Levantadas em 2026-10-07 ao comparar o artefato https://claude.ai/artifact/PwGC8XAgiawWSwqvnEbMmb
(última alteração em 2026-10-05) com `@church/ui`. Cada item mostra o que o artefato diz em dois
lugares diferentes e o que `.tasks/lamb-alinhamento.md` assumiu, aplicando a regra de precedência
da seção Decided:

- (a) A regra global de acessibilidade vence o CSS.
- (b) O token declarado vence a aritmética do CSS.
- (c) No resto, vale o `bundle.css`.

## Tokens e regras globais

| # | Onde | Conflito | Assumido |
|---|---|---|---|
| 1 | README · Consumo | Manda carregar `tokens.css`, que não está no pacote publicado | Tokens lidos de `tokens.json` |
| 2 | README · Tipografia | Manda usar classes `.body-medium`, mas o `bundle.css` só define `.lamb-t-functional-*` e `.lamb-t-body-medium/small/xsmall`; faltam headline, display e body-large | Estilos de `tokens.json` (critério 19) |
| 3 | `bundle.css` · cabeçalho | Diz "every value reads a token", mas há literais: `14px` no Button lg, alturas 20/24/32 do Badge, gap 18 no AvatarContent, `var(--space-10, 10px)` fora da escala | Valores do CSS; `space-10` é o `2.5` do Tailwind |
| 4 | README · Raios × tokens.json | `radius-2xs` (4px) existe nos tokens e no CountBadge, mas não na lista do README | Mantido (`rounded-sm`) |
| 5 | README · Ícones | Fixa 16/20/24, mas o Badge sm usa 14, o Checkbox usa 14 e 26 e a paginação usa 18 | CSS (c): tokens 14/18/26 adicionados |
| 6 | README · Texto mínimo 12px | As iniciais do Avatar xs são 10px | 12px (a) |
| 7 | README · Estados | "Botões escurecem um passo", mas o High neutral vai de neutral-999 para neutral-100 (clareia no light) | CSS (c) |
| 8 | README · Foco | "Anel 2px offset 2px em todo focável", mas o campo usa borda + sombra de 1px sem offset, e `.lamb :focus-visible` acaba pintando o `<input>` interno | Campo: borda + sombra (critério 22); demais: anel (critério 4) |
| 9 | README · Disabled | "`text-disabled` sobre `bg-disabled`", mas o campo disabled usa `bg-hover` + `border-default`, e o Checkbox usa `neutral-33` cru | CSS (c), com token equivalente |
| 10 | README · Toque | "Controles de 32px ganham área até 44", mas só o Button sm expande, e só na altura; NavItem, botões de página, fechar do Toast e Checkbox sm não expandem | Só Button e IconButton `small` (critérios 7 e 9); levar ao designer |
| 11 | README · Pressed | Citado em SearchField e Button, mas no campo só existe como hook de demo (`[data-demo=pressed]`) | Botão: `:active` = hover; campo: sem pressed |
| 12 | README · Tipografia | Rótulos "Functional 500", mas `.lamb-label` é 400 16/24; células "Body 400", mas `.lamb-cell-label` é 500 | CSS (c) |
| 13 | Estilos inexistentes | 14/20 (helper, Tooltip, título do Toast), 18/32 (rótulo lg de Checkbox, Radio e Toggle) não são estilos tipográficos | CSS (c) |
| 14 | Breakpoint | CSS `max-width: 960px`, JS `(max-width: 959px)`, README "abaixo de 960px": em 960 exatos CSS e JS discordam | Fora desta task (Page/SideMenu) |

## Componentes

| # | Componente | Conflito | Assumido |
|---|---|---|---|
| 15 | Button | O d.ts tem padrão `status="accent"` e `size="lg"`, mas o README diz que a ação principal do backoffice é `neutral` | Padrão atual, `neutral` (decisão do usuário) |
| 16 | Badge | O README diz "High = {cor}-83", mas o neutral high é `neutral-999` + `text-inverse` | CSS |
| 17 | Tooltip | Tipografia descrita três vezes: Functional (README), functional-large 18/28 (tokens) e 14/20 (CSS md) | CSS: 14/20 e 18/28 (critério 16) |
| 18 | Tooltip | Sobrescreve o `aria-describedby` do gatilho e apaga o vínculo hint/erro que o README global exige | Mesclar (a) |
| 19 | Icon | Diz que `expand_more` "tem o mesmo nome" no Symbols; em `material-symbols@0.40.2` ele não existe no tipo | Alias mantido |
| 20 | TextField | `min-height` 48/56, mas padding + linha + borda dá 50/58 | 48/56 (b) |
| 21 | TextArea | README e d.ts dizem "conta grafemas", mas o JS conta code points | Code points (comportamento real) |
| 22 | SearchField | Sem rótulo visível, contra "todo campo tem rótulo visível" | `label` visível continua opcional; sem ele, `aria-label` "Buscar" (critério 30) |
| 23 | Campo | Focado e válido ao mesmo tempo mostra borda verde + sombra neutral-999 | Foco vence (critério 22) |
| 24 | Cell | Duas linhas somam 50 > `td` 48; o README da Table cita o tipo "Check" no Cell, mas o `CellProps` não tem `check` | Altura mínima 48; `check` mantido no repositório |
| 25 | Toast | O README diz título headline-x-small 14/16, mas o CSS usa 14/20 | CSS (critério 41) |
| 26 | Pagination | Hover dos botões de navegação (`bg-hover`) igual ao repouso (a10): sem feedback | Hover `neutral-alpha/20` (critério 39); levar ao designer |
| 27 | NavigationBar | O README diz "sem sombra", mas tokens.json atribui `elevation-low-above` à Navigation bar (e o README, ao BottomSheet) | Fora desta task |
| 28 | NavItem | `.lamb-navitem[data-active="true"]` nunca é emitido pelo JS (seletor morto) | Ignorado |
| 29 | SideMenu | Pai colapsado vira link para `href`; um pai sem `href` fica sem destino. O Profile sem `role` gera o rótulo "…, undefined" | Fora desta task; levar ao designer |
| 30 | Table | O preview usa ações de célula como Button `flat` neutral sm, mas o padrão do Button é `high accent lg`; quem omitir as props recebe um botão azul grande na tabela | A Cell usa `IconButton variant="transparent" color="neutral" size="small"` (critério 35) |
