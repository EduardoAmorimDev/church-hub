// invariant: the 16 Lamb effect styles, verbatim from tokens.json; the key
// becomes `--elevation-<set>-<direction>` once kebab-cased.
export const elevation = {
  lowBottom12: '0px 8px 12px 0 #00000014',
  lowLowAbove: '0px -8px 12px 0 #00000014',
  lowLowLeft: '-8px 0px 12px 0 #00000014',
  lowLowRight: '8px 0px 12px 0 #00000014',
  lowBottom24: '0px 16px 24px 0 #00000029',
  lowAbove: '0px -16px 24px 0 #00000029',
  lowLeft: '-16px 0px 24px 0 #00000029',
  lowRight: '16px 0px 24px 0 #00000029',
  highBottom: '0px 12px 40px 0 #0000001F',
  highAbove: '0px -12px 40px 0 #0000001F',
  highLeft: '-12px 0px 40px 0 #0000001F',
  highRight: '12px 0px 40px 0 #0000001F',
  deepHighBottom: '0px 24px 48px 0 #0000003D',
  deepHighAbove: '0px -24px 48px 0 #0000003D',
  deepHighLeft: '-24px 0px 48px 0 #0000003D',
  deepHighRight: '24px 0px 48px 0 #0000003D'
} as const
