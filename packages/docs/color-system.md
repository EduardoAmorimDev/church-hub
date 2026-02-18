## Color System

The current design system uses a layered architecture to organize colors, with `primitive colors` and `semantic tokens`, and implemented with theme-aware CSS variables.

### Primitive Colors (`@church/tokens`)

Primitive colors are named using the pattern `{color}{value}` where value represents a percentage on the color scale:

| Value | Meaning  |
| ----- | -------- |
| 17    | Lightest |
| 33    | Light    |
| 50    | Medium   |
| 67    | Dark     |
| 83    | Darker   |
| 100   | Darkest  |

**Available colors:** `grey`, `red`, `orange`, `yellow`, `lime`, `green`, `cyan`, `blue`, `indigo`, `purple`, `pink`

**Special values:** `grey00` (#FFFFFF) and `grey999` (#27272F) for pure white and near-black.

```ts
import { colors } from '@church/tokens'

colors.blue50 // '#4994FF'
colors.grey999 // '#27272F'
```

### Tailwind Integration

The web app imports `@church/tokens/styles/colors.css` and maps base colors to Tailwind. A dark theme inverts the scale (17 ↔ 100, 33 ↔ 83, etc.):

```css
@theme {
  --color-blue-50: var(--blue-50);
  --color-neutral-50: var(--grey-50);
}

[data-theme='dark'] {
  --color-blue-50: var(--blue-67);
  --color-neutral-50: var(--grey-67);
}
```

Usage:

```tsx
<p className="text-blue-50">Accent text</p>
<div className="bg-neutral-17">Light surface</div>
```