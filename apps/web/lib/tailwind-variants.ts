// Wrapper around `tailwind-variants` that teaches its internal merge about this
// design system's custom font-size scale (see tw-theme-extension.ts). Import
// `tv` from here (`~/lib/tailwind-variants`) instead of `tailwind-variants` directly.
export * from 'tailwind-variants'

import { createTV } from 'tailwind-variants'
import { twMergeConfig } from './tw-theme-extension'

export const tv = createTV({ twMergeConfig })
