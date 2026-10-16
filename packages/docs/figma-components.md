# Figma → `@church/ui` map

The Lamb Design System lives in Figma file `7I9GnO3cTPpaJPOUfFsI9t`. This page tells you which
`@church/ui` component or token stands in for what `get_design_context` returns, so design-to-code
reuses the design system instead of copying the generated markup.

It stands in for Figma Code Connect. Code Connect needs a Dev or Full seat on an Organization or
Enterprise Figma plan, and the account connected to the Figma MCP has neither (checked on
2026-10-04). When that changes, turn the rows below into Code Connect templates.

## Components

Nodes from the "Lamb" design-system artifact (2026-10-05), all in file `7I9GnO3cTPpaJPOUfFsI9t`.
Each story's `parameters.design` points at the same node(s); `src/figma-links.spec.ts` keeps the two
in step.

| Figma component (node)                | `@church/ui` import                  | Notes                                                                                                            |
| ------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Avatar (`47:342`)                     | `@church/ui/atoms/Avatar`            |                                                                                                                  |
| Badge (`13803:5494`)                  | `@church/ui/atoms/Badge`             |                                                                                                                  |
| Button (`12968:2661`)                 | `@church/ui/atoms/Button`            |                                                                                                                  |
| IconButton (`13465:1130`)             | `@church/ui/atoms/IconButton`        | Lamb's `Button iconOnly`; kept as its own component with the Button matrix                                       |
| Cell (`13615:5291`)                   | `@church/ui/atoms/Cell`              | `type="avatar"` and `icon` cover Lamb's Avatar and icon cells                                                    |
| Checkbox (`13628:1215`, `13628:1586`) | `@church/ui/atoms/Checkbox`          | atom-checkbox and Checkbox Item                                                                                  |
| Field (`13625:7806`)                  | `@church/ui/atoms/Field`             | The bare input box shared by the fields below                                                                    |
| TextField (`13607:2966`)              | `@church/ui/atoms/TextField`         | `px-[12px] py-[6px] rounded-[8px]` is `size="small"`                                                             |
| TextArea (`13607:3107`)               | `@church/ui/atoms/TextArea`          |                                                                                                                  |
| SearchField (`13607:3072`)            | `@church/ui/atoms/SearchField`       |                                                                                                                  |
| Material Symbols glyph                | `@church/ui/atoms/Icon`              | Use the Figma icon name; Material Icons names are aliased (see `ICON_ALIASES`)                                   |
| NavItem (`12966:3837`, `13506:10602`) | `@church/ui/atoms/NavItem`           | Nav item and Nav sub-item                                                                                        |
| Navigation (`13020:3345`)             | `@church/ui/molecules/Navigation`    | Lamb's Menus: the middle of the SideMenu and the MenuDrawer                                                      |
| Paginator (`13607:2572`)              | `@church/ui/molecules/Paginator`     | "Ir para página" is a numeric field shown from 6 pages up, not the select Figma draws                            |
| Tag (`13596:406`)                     | `@church/ui/atoms/Tag`               |                                                                                                                  |
| Toast (`13805:425`)                   | `@church/ui/molecules/Toast`         |                                                                                                                  |
| Table (`13616:5097`)                  | `@church/ui/organisms/Table`         | `density`, `captionHidden`, `onSortChange` and column `align` follow Lamb                                        |
| Tooltip                               | `@church/ui/atoms/Tooltip`           | The artifact cites no node                                                                                       |
| Typography (`12893:2437`)             | `@church/ui/atoms/Typography`        | See text styles below                                                                                            |
| Divider (`13628:935`)                 | `@church/ui/atoms/Divider`           | Decorative by default; the vertical rule is visible (opacity 0 in Figma)                                         |
| Logo (`12967:3338`)                   | `@church/ui/atoms/Logo`              | `full` = Group 6, `symbol` = Group 7; height through a `h-*` class                                               |
| Chip (`13596:6864`)                   | `@church/ui/atoms/Chip`              | `selected` makes it a toggle (`aria-pressed`)                                                                    |
| Tab (Backoffice `141-4446`)           | `@church/ui/molecules/Tabs`          | Links with `aria-current`, drawn as the `Chip` at `size="small"` (28px); not the ARIA tab pattern               |
| CountBadge                            | `@church/ui/atoms/CountBadge`        | The legacy Badge; the node the artifact cites (`13354:6056`) does not open                                       |
| Spinner                               | `@church/ui/atoms/Spinner`           | Created in Lamb, no Figma node                                                                                   |
| Radio                                 | `@church/ui/atoms/Radio`             | Created in Lamb, no Figma node; grouped by `@church/ui/molecules/RadioGroup`                                     |
| Toggle                                | `@church/ui/atoms/Toggle`            | Created in Lamb, no Figma node; a returned Promise keeps the state until it resolves                             |
| Stack                                 | `@church/ui/atoms/Stack`             | Created in Lamb, no Figma node; spacing matrix of "Espaçamento e composição"                                     |
| AvatarGroup                           | `@church/ui/atoms/AvatarGroup`       | The node the artifact cites (`13616:2874`) does not open; `max` 3, then "+N"                                     |
| Breadcrumb (`13601:3774`)             | `@church/ui/molecules/Breadcrumb`    | `label` names the `<nav>` ("Trilha de navegação")                                                                |
| Alert (`13792:9332`)                  | `@church/ui/molecules/Alert`         | Figma `Status` Positive/Neutral/Negative/Attention = `variant` success/info/error/warning                        |
| StatCard (`13619:2165`)               | `@church/ui/molecules/StatCard`      | Stat card; `SubInfo` comes from the same import                                                                  |
| AvatarContent (`13803:10719`)         | `@church/ui/molecules/AvatarContent` | The avatar sits beside the name, as in the artifact (Figma draws it above)                                       |
| MenuDropdown (`13033:3147`)           | `@church/ui/molecules/MenuDropdown`  | Menu dropdown and menu-item; `MenuItem` comes from the same import; Lamb `danger` = `color="destructive"`        |
| FilterChip                            | `@church/ui/molecules/FilterChip`    | Created in Lamb, no Figma node; `variant="toggle"` renders a `Chip`                                              |
| RadioGroup                            | `@church/ui/molecules/RadioGroup`    | Created in Lamb, no Figma node; groups `@church/ui/atoms/Radio`, `variant="card"` for cards                      |
| EmptyState                            | `@church/ui/molecules/EmptyState`    | Created in Lamb, no Figma node; `status` neutral/success/error                                                   |
| ListItem                              | `@church/ui/molecules/ListItem`      | Created in Lamb, no Figma node; grouped by `@church/ui/organisms/List` and its `ListSection`                     |
| DatePicker                            | `@church/ui/molecules/DatePicker`    | Created in Lamb, no Figma node; values are `ISODate` (`YYYY-MM-DD`) and `DateRange`                              |
| Drawer (`13803:11075`)                | `@church/ui/organisms/Drawer`        | `mode="modal"` (default) traps focus over a scrim; `mode="inline"` is a region; 650px is the `size.drawer` token |
| Dialog                                | `@church/ui/organisms/Dialog`        | Created in Lamb, no Figma node; Lamb `status` = `color`, `sm`/`md`/`lg` = `small`/`medium`/`large`               |
| BottomSheet                           | `@church/ui/organisms/BottomSheet`   | Created in Lamb, no Figma node; `safeArea` defaults to `env` (Lamb's prototype default is `mock`)                |
| Select                                | `@church/ui/organisms/Select`        | Created in Lamb, no Figma node; TextField-family field; popover in Painel, BottomSheet in App                    |
| DateField                             | `@church/ui/organisms/DateField`     | Created in Lamb, no Figma node; `dd/mm/aaaa` mask, `ISODate` value, DatePicker as calendar                       |
| FilterBar                             | `@church/ui/organisms/FilterBar`     | Created in Lamb, no Figma node; panel is a Drawer (Painel) or a `half` BottomSheet (App)                         |
| List                                  | `@church/ui/organisms/List`          | Created in Lamb, no Figma node; `ListSection` from the same import; `density` reaches the items                  |
| Section (`13630:9165`)                | `@church/ui/organisms/Section`       | Header `13630:5151`, footer `13630:10568`; where Figma and the CSS differ, the CSS wins                          |
| PageHeader (`13505:4430`)             | `@church/ui/organisms/PageHeader`    | `type` home (greeting, Display `d3`) or primary (breadcrumb, `<h1>`, actions, chips)                             |
| SideMenu (`12967:3606`)               | `@church/ui/organisms/SideMenu`      | 240px / 64px collapsed; items are `NavItemProps` through the `Navigation`, current page by `activated`           |
| MenuDrawer (`13506:21084`)            | `@church/ui/organisms/MenuDrawer`    | Modal hamburger navigation, 390px, 48px items (`data-viewport="mobile"`); `side` right by default                |
| Page (`13685:3211`)                   | `@church/ui/templates/Page`          | Template; `PageBody` from the same import; SideMenu from 960px, top bar + MenuDrawer below (CSS)                 |

## Text styles

| Figma text style                        | `Typography` variant |
| --------------------------------------- | -------------------- |
| Paragraph/p3 (font-size/25, Regular)    | `p3`                 |
| Body/Small (font-size/50, Regular)      | `p2`                 |
| Functional/Small (font-size/50, Medium) | `f3`                 |

## Variables

| In `get_design_context` output                           | Utility                                           |
| -------------------------------------------------------- | ------------------------------------------------- |
| `var(--neutral/67, …)` and the other colour ramps        | `text-neutral-67`, `bg-neutral-67`, …             |
| `var(--neutral/a10, …)`                                  | `bg-neutral-alpha/10`                             |
| `var(--font-size/50, …)` with `var(--line-height/50, …)` | `text-size-50` (carries its line height)          |
| icon box `size-[16px]`                                   | `Icon size="small"` (`text-icon-16`)              |
| `rounded-[8px]`, `rounded-[10px]`, `rounded-[12px]`      | `rounded-lg`, `rounded-10`, `rounded-xl`          |
| spacing `p-[8px]`, `gap-[4px]`                           | `p-2`, `gap-1` (Tailwind spacing is 4px per step) |

A value with no utility goes into `packages/tokens` first; the lint rule rejects arbitrary values.

## Semantic tokens

Lamb's semantic layer (`tokens.json`) is published by `@church/tokens` and mapped in
`packages/ui/src/styles.css`. Prefer these utilities to the raw ramps: they switch with
`data-theme="dark"`.

| Lamb token              | Utility                                      | Light       | Dark        |
| ----------------------- | -------------------------------------------- | ----------- | ----------- |
| `--text-primary`        | `text-primary`                               | `#27272F`   | `#FFFFFF`   |
| `--text-secondary`      | `text-secondary`                             | `#686F7A`   | `#C1C8D3`   |
| `--text-disabled`       | `text-disabled`                              | `#A3ACBD`   | `#868F9D`   |
| `--text-inverse`        | `text-inverse`                               | `#FFFFFF`   | `#27272F`   |
| `--text-link`           | `text-link`                                  | `#2558A1`   | `#84B7FF`   |
| `--text-danger`         | `text-danger`                                | `#AA2511`   | `#F99D8F`   |
| `--text-positive`       | `text-positive`                              | `#1F7534`   | `#5BD279`   |
| `--text-attention`      | `text-attention`                             | `#5B4801`   | `#FFDF6D`   |
| `--text-accent`         | `text-accent`                                | `#3175D4`   | `#4994FF`   |
| `--text-on-accent`      | `text-on-accent`                             | `#FFFFFF`   | `#27272F`   |
| `--text-on-positive`    | `text-on-positive`                           | `#FFFFFF`   | `#27272F`   |
| `--text-on-danger`      | `text-on-danger`                             | `#FFFFFF`   | `#27272F`   |
| `--text-on-attention`   | `text-on-attention`                          | `#27272F`   | `#FFFFFF`   |
| `--bg-page`             | `bg-page`                                    | `#F0F0F2`   | `#101015`   |
| `--bg-surface`          | `bg-surface`                                 | `#FEFEFE`   | `#27272F`   |
| `--bg-hover`            | `bg-hover`                                   | `#A2ACBD1A` | `#A2ACBD1A` |
| `--bg-selected`         | `bg-selected`                                | `#A2ACBD33` | `#A2ACBD33` |
| `--bg-disabled`         | `bg-disabled`                                | `#DEE1E8`   | `#474B53`   |
| `--bg-action-primary`   | `bg-action-primary`                          | `#27272F`   | `#FFFFFF`   |
| `--bg-accent-solid`     | `bg-accent-solid`                            | `#3175D4`   | `#4994FF`   |
| `--bg-positive-solid`   | `bg-positive-solid`                          | `#1F7534`   | `#5BD279`   |
| `--bg-danger-solid`     | `bg-danger-solid`                            | `#E03116`   | `#F56752`   |
| `--bg-attention-solid`  | `bg-attention-solid`                         | `#F4BF01`   | `#886A01`   |
| `--bg-accent-subtle`    | `bg-accent-subtle`                           | `#3388FF1A` | `#3388FF1A` |
| `--bg-positive-subtle`  | `bg-positive-subtle`                         | `#16CA441A` | `#16CA441A` |
| `--bg-danger-subtle`    | `bg-danger-subtle`                           | `#FF4E331A` | `#FF4E331A` |
| `--bg-attention-subtle` | `bg-attention-subtle`                        | `#FFC9001A` | `#FFC9001A` |
| `--bg-scrim`            | `bg-scrim`                                   | `#27272F99` | `#27272F99` |
| `--border-default`      | `border-default`                             | `#DEE1E8`   | `#474B53`   |
| `--border-control`      | `border-control`                             | `#868F9D`   | `#A3ACBD`   |
| `--focus-ring`          | `outline-focus-ring` (and `ring-focus-ring`) | `#27272F`   | `#FFFFFF`   |
| `--brand-red`           | `text-brand-red`, `fill-brand-red`           | `#EF2F29`   | `#EF2F29`   |
| `--brand-blue`          | `text-brand-blue`, `fill-brand-blue`         | `#3255AE`   | `#3255AE`   |
| `--brand-teal`          | `text-brand-teal`, `fill-brand-teal`         | `#46C0A3`   | `#46C0A3`   |

The 16 elevation styles are `shadow-elevation-<set>-<direction>` (for example
`shadow-elevation-high-bottom`).

## Radius

The Tailwind radius scale is kept, so an existing `rounded-lg` keeps meaning 8px. Lamb's radius
names map to it as follows:

| Lamb radius | px   | Utility       |
| ----------- | ---- | ------------- |
| `2xs`       | 4px  | `rounded-sm`  |
| `xs`        | 6px  | `rounded-md`  |
| `sm`        | 8px  | `rounded-lg`  |
| `md`        | 10px | `rounded-10`  |
| `lg`        | 12px | `rounded-xl`  |
| `xl`        | 16px | `rounded-2xl` |
| `2xl`       | 24px | `rounded-3xl` |
