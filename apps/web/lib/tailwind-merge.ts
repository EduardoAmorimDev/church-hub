// Wrapper around `tailwind-merge` that teaches it about this design system's
// custom font-size scale (see tw-theme-extension.ts). Import `twMerge` from
// here (`~/lib/tailwind-merge`) instead of `tailwind-merge` directly.
export * from 'tailwind-merge'

import { extendTailwindMerge } from 'tailwind-merge'
import { twMergeConfig } from './tw-theme-extension'

export const twMerge = extendTailwindMerge(twMergeConfig)
