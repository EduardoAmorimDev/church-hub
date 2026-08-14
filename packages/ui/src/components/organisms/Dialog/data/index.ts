import type { IconName } from '@church/ui/atoms/Icon'
import type { DialogColor } from '../Dialog.types'

export const DIALOG_ICON: Record<DialogColor, IconName> = {
  neutral: 'info',
  destructive: 'report',
  positive: 'check_circle',
  attention: 'warning'
}

// invariant: the Button has no `attention` colour; Lamb keeps it neutral.
export const PRIMARY_COLOR: Record<
  DialogColor,
  'neutral' | 'destructive' | 'positive'
> = {
  neutral: 'neutral',
  destructive: 'destructive',
  positive: 'positive',
  attention: 'neutral'
}

// invariant: Lamb's App density (≤ 959px) is the base; `panel:` (960px) and
// an ancestor `[data-viewport]` switch to Painel (Stack `auto` pattern).
// Literal so Tailwind sees every class.
export const DIALOG_HEADER_DENSITY =
  'px-5 pt-5 panel:not-in-data-[viewport=mobile]:px-6 panel:not-in-data-[viewport=mobile]:pt-6 in-data-[viewport=desktop]:px-6 in-data-[viewport=desktop]:pt-6'

export const DIALOG_BODY_DENSITY =
  'px-5 pb-5 panel:not-in-data-[viewport=mobile]:px-6 panel:not-in-data-[viewport=mobile]:pb-6 in-data-[viewport=desktop]:px-6 in-data-[viewport=desktop]:pb-6'

// invariant: App stacks the actions full width, primary last (bottom).
export const DIALOG_FOOTER_DENSITY =
  'flex-col items-stretch px-5 pt-3 pb-5 *:w-full panel:not-in-data-[viewport=mobile]:flex-row panel:not-in-data-[viewport=mobile]:items-center panel:not-in-data-[viewport=mobile]:px-6 panel:not-in-data-[viewport=mobile]:pt-4 panel:not-in-data-[viewport=mobile]:pb-6 panel:not-in-data-[viewport=mobile]:*:w-auto in-data-[viewport=desktop]:flex-row in-data-[viewport=desktop]:items-center in-data-[viewport=desktop]:px-6 in-data-[viewport=desktop]:pt-4 in-data-[viewport=desktop]:pb-6 in-data-[viewport=desktop]:*:w-auto'
