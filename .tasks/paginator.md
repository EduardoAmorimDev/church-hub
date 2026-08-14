# Paginator do design system

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

A `Table` do design system (`apps/web/components/organisms/Table`) recebe apenas as linhas que
deve exibir (`rows`) e não oferece nenhum meio de navegar por um conjunto maior. Toda tela que
listar mais registros do que cabem numa página — o caso típico de uma listagem de membros — teria
de desenhar a própria paginação, cada uma de um jeito, fora do design system. O source não traz
números de impacto.

Passa a existir o `Paginator`, um componente controlado que fica abaixo da `Table` e reproduz o
componente "Paginação" do Figma (node `13607:2572`): seletor "Linhas:", contador "1-10 de 300
itens", botões primeira/anterior, números de página, próxima/última e, quando há 6 páginas ou
mais, um campo numérico "Ir para página:" no lugar do seletor desenhado no Figma. O consumidor
mantém `page` e `pageSize` e entrega à `Table` só as linhas da página atual.

17 critérios em 4 slices · 4 one-way doors · 0 open, 0 block

## Criteria

### Exibe a posição atual na lista

1. Dado `page=1`, `pageSize=10`, `totalItems=300`, então o componente renderiza, da esquerda para
   a direita: o texto "Linhas:" com um seletor exibindo `10`; o texto "1-10 de 300 itens"; os
   botões "Primeira página" e "Página anterior"; os botões numéricos `1`, `2`, `3`, com `1`
   marcado `aria-current="page"`; os botões "Próxima página" e "Última página"; o texto "Ir para
   página:" com um campo numérico vazio.
2. Dado `page=30`, `pageSize=10`, `totalItems=295`, então o contador exibe "291-295 de 295 itens"
   e os botões numéricos são `28`, `29`, `30`, com `30` como atual.
3. Dado `totalItems=1`, `pageSize=10`, `page=1`, então o contador exibe "1-1 de 1 item"
   (singular).
4. Sempre, o visual segue o Figma `13607:2572`: container `justify-between` com padding 8px;
   botões numéricos de 32px de largura, `rounded-lg`, Typography `f3`, o atual com borda 1px
   `neutral-999` e texto `neutral-100` e os demais sem borda e com texto `neutral-83`; os quatro
   botões de navegação são `IconButton` `variant="ghost"` `size="small"` (fundo
   `neutral-alpha/10`, ícone de 16px) com os ícones `first_page`, `chevron_left`,
   `chevron_right` e `last_page`; os textos "Linhas:", contador e "Ir para página:" usam
   Typography `p3` em `neutral-67`; o seletor "Linhas:" e o campo "Ir para página:" têm 68px ×
   32px, padding horizontal 12px, `rounded-lg`, anel de 1px `neutral-33` e valor em
   `text-size-50`; só o seletor tem o chevron `expand_more` de 20px. Nenhum valor arbitrário de
   Tailwind.
5. Sempre, a raiz é um `<nav aria-label="Paginação">`, cada botão numérico tem `aria-label`
   "Página N" e o seletor e o campo são encontrados pelos rótulos visíveis "Linhas:" e "Ir para
   página:" (`getByLabelText`).

### Navega entre páginas

6. Dado `page=5` de 30 páginas, quando o usuário clica em "Primeira página", "Página anterior",
   "Próxima página" e "Última página", então `onPageChange` é chamado uma vez por clique com `1`,
   `4`, `6` e `30`, respectivamente.
7. Dado `page=1`, quando o usuário clica no botão numérico `2`, então `onPageChange` é chamado
   uma vez com `2`; quando clica no `1` (página atual), `onPageChange` não é chamado.
8. Dado `page=1`, então "Primeira página" e "Página anterior" estão `disabled` e o clique não chama
   `onPageChange`; dado `page` igual à última página, "Próxima página" e "Última página" estão
   `disabled` e o clique não chama `onPageChange`.
9. Sempre, os botões numéricos são até 3 páginas consecutivas que contêm a atual, limitadas às
   bordas: `page=15` de 30 mostra `14 15 16`; `page=1` mostra `1 2 3`; `page=30` mostra
   `28 29 30`; com 2 páginas no total mostra `1 2`.
10. Dado `page=1` de 30 páginas, quando o usuário digita `17` em "Ir para página:" e pressiona
    Enter, então `onPageChange` é chamado uma vez com `17` e o campo volta a ficar vazio; digitar
    `1` (página atual) e pressionar Enter não chama `onPageChange`.
11. Dado `pageSize=10`, então com `totalItems=60` (6 páginas) o campo "Ir para página:" e seu
    rótulo são renderizados, e com `totalItems=50` (5 páginas) nenhum dos dois é renderizado.
12. Se o usuário pressionar Enter em "Ir para página:" com `0`, `31` (de 30 páginas), `2.5`, `abc`
    ou o campo vazio, então `onPageChange` não é chamado e o campo fica com `state="error"` do
    `Field` até o próximo caractere digitado.

### Altera o tamanho da página

13. Dado `pageSizeOptions` omitido, então o seletor "Linhas:" lista `10`, `20`, `50`; quando o
    usuário escolhe `20`, então `onPageSizeChange` é chamado uma vez com `20` e `onPageChange`
    uma vez com `1`.
14. Dado `pageSize=15` e `pageSizeOptions=[10, 20, 50]`, então o seletor "Linhas:" exibe `15` e
    lista `10`, `15`, `20`, `50`.

### Limites e uso com a Table

15. Dado `totalItems=0`, então o contador exibe "0 itens", nenhum botão numérico nem o campo "Ir
    para página:" é renderizado e os quatro botões de navegação estão `disabled`; o seletor
    "Linhas:" continua habilitado.
16. Se `page` estiver fora de `1…totalPages` (`page=40` ou `page=0` com 30 páginas), então o
    componente exibe a página limitada ao intervalo (`30` e "291-300 de 300 itens"; `1` e "1-10 de
    300 itens") sem chamar `onPageChange` durante a renderização; se `pageSize` não for inteiro
    positivo, renderiza como `totalItems=0` (critério 15), sem `NaN` nem `Infinity` no contador.
17. No Storybook, o `Paginator` tem uma story padrão com `parameters.design` apontando para o
    Figma `13607:2572` e uma story que compõe `Table` + `Paginator` com 30 linhas sintéticas,
    onde clicar em "Página 2" faz a `Table` exibir as linhas 11 a 20 e o contador "11-20 de 30
    itens".

## Out of scope

- Lista aberta estilizada (o "Menu dropdown" do Figma) para "Linhas:" - decidido usar `<select>`
  nativo; a troca futura fica interna ao `Paginator` e não muda a API pública.
- Seletor de página em "Ir para página:" - substituído pelo campo numérico por decisão do usuário
  (2026-10-04); o Figma ainda mostra o seletor.
- Prop de paginação dentro da `Table` ou fatiamento das linhas - a `Table` segue recebendo só as
  linhas visíveis; quem fatia (cliente ou servidor) é o consumidor.
- Estado desabilitado/carregando no `Paginator` - confirmado pelo usuário: o consumidor mantém os
  últimos valores ou não renderiza o componente enquanto a `Table` carrega.
- Reticências ("…") ou saltos entre faixas de páginas - o design mostra só 3 números.
- Sincronizar `page`/`pageSize` com a URL ou persistir entre visitas - não pedido.
- Layout compacto para larguras estreitas - o Figma só define a largura de 1088px.
- `apps/native` - o design system hoje vive em `apps/web`.
- Corrigir o `Button` atom, que não repassa `variant` ao `tv` (`Button.tsx`, `button({ className,
  color, size })`) - observado, não tocado; o `Paginator` não depende dele.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| componente `Paginator` | empty state | 15 |
| componente `Paginator` | loading state | n/a - sem estado próprio; o consumidor decide (confirmado pelo usuário, ver Out of scope) |
| componente `Paginator` | error state | 12 (entrada inválida no campo); n/a para dados - não faz chamada assíncrona |
| componente `Paginator` | unauthorised state | n/a - componente de design system sem dados nem permissões |
| componente `Paginator` | density | 4 |
| componente `Paginator` | ordering | 1, 9, 13, 14 |
| componente `Paginator` | destructive action confirms | n/a - nenhuma ação destrutiva |
| copy `Paginator` | textos e tom | 1, 3, 15 |
| copy `Paginator` | o que o leitor faz em seguida | 6, 7, 10, 13 |
| copy `Paginator` | nomes acessíveis | 5 |

## Swept

- validation: 12, 14, 16
- failure modes: n/a - sem I/O nem promessas; as entradas inválidas possíveis (digitação e props) estão em validation
- idempotency and retry: 7, 10 (ir para a página atual não emite `onPageChange`)
- authorization: n/a - componente de UI sem dados nem permissões
- concurrency and ordering: n/a - componente controlado: cada ação deriva o valor da prop `page` atual, então dois cliques antes do re-render emitem o mesmo valor; a corrida entre requisições é do consumidor
- data lifecycle: n/a - não guarda estado além do texto digitado no campo e não persiste nada
- external-dependency failure: n/a - não chama serviço externo
- state transitions: 6, 7, 8, 10, 13 (as transições são emitidas por callback; o componente não as guarda)
- observability: n/a - componente de UI; o Princípio XIV proíbe log de depuração e o comportamento é observado pela spec

## Impact

| Front | What changes |
|---|---|
| domain | new term: `Paginator` - componente controlado que exibe e altera a página e o tamanho de página de uma lista, vive em `apps/web/components/molecules` |
| componentes existentes | `Field` atom (`size="small"`: `h-8 px-3 rounded-lg text-size-50`, `state="error"`) reutilizado no campo "Ir para página:" sem alteração |
| componentes existentes | `fieldDefaultRing` / `FieldControlTag` (`components/utils/fieldRingStyles.ts`) só aceita `'input' \| 'textarea'`; se o seletor "Linhas:" reutilizar o anel, ganha `'select'` sem alterar os valores que `Field` e `TextArea` já usam |
| componentes existentes | `Table` - nada muda na API; só aparece composta numa story |
| stored data | nothing to migrate |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| API pública controlada, página 1-based | `{ page: number; pageSize: number; totalItems: number; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void; pageSizeOptions?: ReadonlyArray<number>; className?: string }` | Estado interno não controlado - não sincroniza com paginação no servidor e destoa da `Table`, controlada por `selectedIds`/`onSelectionChange`. Índice 0-based - não bate com o número exibido nem com o número digitado em "Ir para página"; isso fecha a porta para repassar direto o `pageIndex` 0-based do `@tanstack/react-table`: quem usá-lo converte com `page - 1` |
| `Paginator` irmão da `Table`, não uma prop dela | `<Table rows={linhasDaPagina} … />` seguido de `<Paginator … />` | `pagination` dentro da `Table` - a `Table` passaria a conhecer `totalItems` e a decidir entre fatiar no cliente ou no servidor, que hoje não são responsabilidade dela |
| Nome e nível atômico | `Paginator`, exportado de `~/components/molecules/Paginator` | Organism - compõe apenas atoms (`IconButton`, `Icon`, `Typography`, `Field`) e um `<select>` nativo, sem molecules nem contexto; o nome segue o pedido do usuário e o `aria-label` usa o termo do Figma, "Paginação" |
| "Linhas:" como `<select>` nativo, primeiro seletor do design system | Caixa fechada estilizada com os tokens do critério 4; a lista aberta é a nativa do SO | Implementar antes o "Menu dropdown" do Figma - recusado pelo usuário em 2026-10-04; viraria uma segunda task com restrição de ordem |

## Sources

- Figma, Lamb Design System, componente "Paginação" - node `13607:2572` (frame `13628:13675`),
  https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13628-13675&m=dev
  - **binding for the interface**, exceto "Ir para página:" (ver abaixo): valores transcritos nos
  critérios 1 e 4; a copy ("Linhas:", "1-10 de 300 itens", "Ir para página:") está nesse node.
- Conversa com o usuário, 2026-10-04 (sem endereço) - "<select> nativo (Recomendado)" para
  "Linhas:"; "Todas as perguntas que você falou estão corretas. do 1 ao 8." (confirma os critérios
  8, 9, 13, 3/15, 16 e a ausência de estado de carregamento); "deixe apenas um campo numérico para
  que o usuário inpute o número da página alvo"; "O campo numérico só deve ser mostrado se existir
  6 ou mais páginas totais da tabela" (critérios 10 e 11); "Concordo." (confirma: só Enter navega,
  inválido é rejeitado com `state="error"`, o campo começa vazio e se esvazia após navegar).
- `docs/constitution.md` - Princípios I (spec + story), II (atomic design), IV (tokens), VIII
  (casos de borda na spec).

This task is the record of decision. If a linked document diverges, ask before building.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| - | | None | |
