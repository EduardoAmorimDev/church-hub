// why: `twMerge` must know the design system's font-size scale (see
// tw-theme-extension.ts); import it from `@church/ui/lib/tailwind-merge`.
export * from 'tailwind-merge'

import { extendTailwindMerge } from 'tailwind-merge'
import { twMergeConfig } from './tw-theme-extension'

export const twMerge = extendTailwindMerge(twMergeConfig)
