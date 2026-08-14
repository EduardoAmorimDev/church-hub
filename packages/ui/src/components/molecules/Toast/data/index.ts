import { TypeOptions } from 'react-toastify'

// why: react-toastify styles its toast after Tailwind loads, so every class
// that overrides one of its properties carries `!`.
export const TOAST_BOX_CLASSES = [
  'mb-0! min-h-0! max-w-80! rounded-10! p-3! font-sans!',
  'shadow-elevation-high-bottom!'
].join(' ')

export const TOAST_TYPE_CLASSES: Record<TypeOptions, string> = {
  error: 'bg-danger-solid! text-on-danger!',
  success: 'bg-positive-solid! text-on-positive!',
  info: 'bg-action-primary! text-inverse!',
  warning: 'bg-attention-solid! text-on-attention!',
  default: 'bg-action-primary! text-inverse!'
}
