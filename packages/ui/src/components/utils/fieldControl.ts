import { tv } from '@church/ui/lib/tailwind-variants'

// invariant: one box for every field of the base (Field, TextArea and the
// Paginator jump field), so their rest, hover, focus, error, success and
// disabled looks never drift apart. danger-solid is red-67 and
// positive-solid green-83 in both themes; borders and rings use the primitive.
export const fieldControl = tv({
  base: 'group border transition-[border-color,box-shadow] duration-150 ease-out',
  variants: {
    state: {
      default: '',
      error: '',
      success: ''
    },
    disabled: {
      false: 'cursor-text bg-surface',
      true: 'cursor-not-allowed border-default bg-hover'
    }
  },
  compoundVariants: [
    // hazard: `hover` sorts after `focus-within` in Tailwind, so hover is
    // limited to an unfocused box or it would repaint the focus border.
    {
      disabled: false,
      state: 'default',
      class: [
        'border-control hover:not-focus-within:border-neutral-83',
        'focus-within:border-focus-ring focus-within:ring-1 focus-within:ring-focus-ring'
      ]
    },
    {
      disabled: false,
      state: 'error',
      class: 'border-red-67 ring-1 ring-red-67'
    },
    {
      disabled: false,
      state: 'success',
      class: 'border-green-83 focus-within:ring-1 focus-within:ring-focus-ring'
    }
  ],
  defaultVariants: {
    disabled: false,
    state: 'default'
  }
})

export const fieldText = tv({
  variants: {
    disabled: {
      false: 'text-primary placeholder:text-secondary',
      true: 'cursor-not-allowed text-disabled placeholder:text-disabled'
    }
  },
  defaultVariants: { disabled: false }
})

export const FIELD_ICON_COLOR =
  'text-secondary data-[disabled=true]:text-disabled'

// why: Lamb's in-field action (show password, clear search) keeps a 32px
// target that its negative margin folds into the field's padding.
export const fieldActionButton = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center rounded-lg',
    'text-secondary transition-colors not-disabled:hover:bg-hover'
  ],
  variants: {
    size: {
      small: 'size-6 -m-1',
      medium: 'size-8 -m-1',
      large: 'size-8 -m-1'
    }
  },
  defaultVariants: { size: 'medium' }
})

export const fieldWrapper = tv({
  base: 'flex flex-col',
  variants: {
    size: {
      small: 'gap-1',
      medium: 'gap-1.5',
      large: 'gap-2'
    }
  },
  defaultVariants: { size: 'medium' }
})
