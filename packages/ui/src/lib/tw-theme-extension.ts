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
        'icon-14',
        'icon-16',
        'icon-18',
        'icon-20',
        'icon-24',
        'icon-26',
        'icon-28'
      ],
      shadow: [
        'elevation-low-bottom-12',
        'elevation-low-low-above',
        'elevation-low-low-left',
        'elevation-low-low-right',
        'elevation-low-bottom-24',
        'elevation-low-above',
        'elevation-low-left',
        'elevation-low-right',
        'elevation-high-bottom',
        'elevation-high-above',
        'elevation-high-left',
        'elevation-high-right',
        'elevation-deep-high-bottom',
        'elevation-deep-high-above',
        'elevation-deep-high-left',
        'elevation-deep-high-right'
      ]
    }
  }
}
