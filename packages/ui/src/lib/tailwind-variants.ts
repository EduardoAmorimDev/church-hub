// why: `tv` must share the design system's font-size scale with tailwind-merge
// (see tw-theme-extension.ts); import it from `@church/ui/lib/tailwind-variants`.
export * from 'tailwind-variants'

import { createTV } from 'tailwind-variants'
import { twMergeConfig } from './tw-theme-extension'

export const tv = createTV({ twMergeConfig })
