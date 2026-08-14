# Figma → `@church/ui` map

The Lamb Design System lives in Figma file `7I9GnO3cTPpaJPOUfFsI9t`. This page tells you which
`@church/ui` component or token stands in for what `get_design_context` returns, so design-to-code
reuses the design system instead of copying the generated markup.

It stands in for Figma Code Connect. Code Connect needs a Dev or Full seat on an Organization or
Enterprise Figma plan, and the account connected to the Figma MCP has neither (checked on
2026-10-04). When that changes, turn the rows below into Code Connect templates.

## Components

| Figma component (node)                    | `@church/ui` import                                              | Notes                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Avatar (`47:342`)                         | `@church/ui/atoms/Avatar`                                        |                                                                                           |
| Badge (`13354:6107`)                      | `@church/ui/atoms/Badge`                                         | **Stale link**: the node no longer exists in the file                                     |
| Button (`13352:328`)                      | `@church/ui/atoms/Button`                                        | **Stale link**: the node no longer exists in the file                                     |
| Button, icon only                         | `@church/ui/atoms/IconButton`                                    | `p-[8px] rounded-[8px] bg neutral/a10` + 16px icon is `variant="ghost" size="small"`      |
| Cell (`13615:5291`)                       | `@church/ui/atoms/Cell`                                          |                                                                                           |
| Checkbox                                  | `@church/ui/atoms/Checkbox`                                      | The story has no Figma link yet                                                           |
| Input text / `_text field` (`13625:7806`) | `@church/ui/atoms/Field`, `TextField`, `TextArea`, `SearchField` | `px-[12px] py-[6px] rounded-[8px]` is `size="small"`                                      |
| Material Symbols glyph                    | `@church/ui/atoms/Icon`                                          | Use the Figma icon name; `expand_more` and `expand_less` are aliases (see `ICON_ALIASES`) |
| Navigation / NavItem (`12964:1203`)       | `@church/ui/molecules/Navigation`, `@church/ui/atoms/NavItem`    |                                                                                           |
| Paginação (`13607:2572`)                  | `@church/ui/molecules/Paginator`                                 | "Ir para página" is a numeric field shown from 6 pages up, not the select Figma draws     |
| Tag (`13596:907`)                         | `@church/ui/atoms/Tag`                                           |                                                                                           |
| Toast (`13596:1430`)                      | `@church/ui/molecules/Toast`                                     |                                                                                           |
| Table (`13616:5097`)                      | `@church/ui/organisms/Table`                                     |                                                                                           |
| Tooltip                                   | `@church/ui/atoms/Tooltip`                                       | The story has no Figma link yet                                                           |
| Typography (`12893:2437`)                 | `@church/ui/atoms/Typography`                                    | See text styles below                                                                     |
| Menu dropdown                             | —                                                                | Not built yet; the Paginator uses a native `<select>`                                     |

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
