// invariant: the Lamb spacing matrix (tier × relation × density), in the
// guideline "Espaçamento e composição". Class strings stay literal so the
// Tailwind scanner sees every one; `auto` is App by default, Painel from the
// `panel:` breakpoint, and an ancestor `[data-viewport]` overrides both.
export type StackTier = 'primitive' | 'composite' | 'block'
export type StackRelation = 'strong' | 'weak' | 'none'

type Cell = `${StackTier}-${StackRelation}`
export type GapKey = Cell | 'primitive-strong-interactive' | 'block-weak-bare'

export const PANEL_GAP: Record<Cell | 'block-weak-bare', string> = {
  'primitive-strong': 'gap-2',
  'primitive-weak': 'gap-4',
  'primitive-none': 'gap-6',
  'composite-strong': 'gap-3',
  'composite-weak': 'gap-4',
  'composite-none': 'gap-6',
  'block-strong': 'gap-4',
  'block-weak': 'gap-4',
  'block-weak-bare': 'gap-6',
  'block-none': 'gap-6'
}

export const APP_GAP: Record<Cell | 'primitive-strong-interactive', string> = {
  'primitive-strong': 'gap-2',
  'primitive-strong-interactive': 'gap-3',
  'primitive-weak': 'gap-4',
  'primitive-none': 'gap-8',
  'composite-strong': 'gap-4',
  'composite-weak': 'gap-6',
  'composite-none': 'gap-8',
  'block-strong': 'gap-6',
  'block-weak': 'gap-8',
  'block-none': 'gap-8'
}

export const AUTO_GAP: Record<GapKey, string> = {
  'primitive-strong': 'gap-2',
  'primitive-strong-interactive':
    'gap-3 panel:not-in-data-[viewport=mobile]:gap-2 in-data-[viewport=desktop]:gap-2',
  'primitive-weak': 'gap-4',
  'primitive-none':
    'gap-8 panel:not-in-data-[viewport=mobile]:gap-6 in-data-[viewport=desktop]:gap-6',
  'composite-strong':
    'gap-4 panel:not-in-data-[viewport=mobile]:gap-3 in-data-[viewport=desktop]:gap-3',
  'composite-weak':
    'gap-6 panel:not-in-data-[viewport=mobile]:gap-4 in-data-[viewport=desktop]:gap-4',
  'composite-none':
    'gap-8 panel:not-in-data-[viewport=mobile]:gap-6 in-data-[viewport=desktop]:gap-6',
  'block-strong':
    'gap-6 panel:not-in-data-[viewport=mobile]:gap-4 in-data-[viewport=desktop]:gap-4',
  'block-weak':
    'gap-8 panel:not-in-data-[viewport=mobile]:gap-4 in-data-[viewport=desktop]:gap-4',
  'block-weak-bare':
    'gap-8 panel:not-in-data-[viewport=mobile]:gap-6 in-data-[viewport=desktop]:gap-6',
  'block-none':
    'gap-8 panel:not-in-data-[viewport=mobile]:gap-6 in-data-[viewport=desktop]:gap-6'
}
