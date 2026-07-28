// This design system replaces Tailwind's default font-size scale with custom
// tokens (text-size-25 ... text-size-500, see app/styles.css). tailwind-merge
// ships a fixed list of what counts as a "font-size" class and doesn't know
// about this custom scale, so it falls through to the (very permissive)
// text-color group instead, which matches almost any `text-*` suffix. That
// causes it to silently drop text-size-* classes whenever a real text color
// class is present in the same className, since it thinks they conflict.
//
// Registering the scale here fixes conflict detection for both `twMerge`
// (lib/tailwind-merge.ts) and `tv` (lib/tailwind-variants.ts).
export const twMergeConfig = {
  extend: {
    theme: {
      text: [
        'size-25',
        'size-50',
        'size-75',
        'size-100',
        'size-200',
        'size-300',
        'size-400',
        'size-500'
      ]
    }
  }
}
