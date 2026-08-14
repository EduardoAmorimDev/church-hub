// why: the theme replaces Tailwind's font-size scale with text-size-* tokens
// (src/styles.css). tailwind-merge does not know them, files them under text
// colour and drops text-size-* next to a colour class; registering the scale
// fixes `twMerge` and `tv` alike.
export const twMergeConfig = {
  extend: {
    theme: {
      radius: ['10'],
      text: [
        'size-10',
        'size-25',
        'size-50',
        'size-75',
        'size-100',
        'size-200',
        'size-300',
        'size-400',
        'size-500',
        'icon-12',
        'icon-16',
        'icon-20',
        'icon-24',
        'icon-28'
      ]
    }
  }
}
