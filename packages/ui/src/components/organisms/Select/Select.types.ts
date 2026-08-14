import { ComponentProps, ReactNode } from 'react'
import { Control, FieldValues, RegisterOptions } from 'react-hook-form'
import type { IconName } from '@church/ui/atoms/Icon'

export type SelectOption = {
  value: string
  label: string
  description?: string
  iconName?: IconName
  disabled?: boolean
}

export type SelectPresentation = 'auto' | 'popover' | 'sheet'

export type SelectProps<TFieldValues extends FieldValues = FieldValues> = {
  options: SelectOption[]
  /** invariant: with `value` (even `null`) the Select only shows what the
   * prop says; without it, `defaultValue` seeds an internal choice. */
  value?: string | null
  defaultValue?: string | null
  /** invariant: `(null, null)` when cleared. */
  onChange?: (value: string | null, option: SelectOption | null) => void
  placeholder?: string
  searchable?: boolean
  searchPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  /** why: `auto` decides Painel (popover) or App (BottomSheet) when the list
   * opens, never in render (lamb-fields-lists Decided 1). */
  presentation?: SelectPresentation
  defaultOpen?: boolean
  id?: string
  className?: string
  label?: string
  helperText?: ReactNode
  state?: 'default' | 'error' | 'success'
  /** invariant: `false` (default) marks the field required with `*`;
   * `true` shows "(Opcional)". */
  optional?: boolean
  size?: 'small' | 'medium' | 'large'
  control?: Control<TFieldValues>
  name?: string
  rules?: RegisterOptions<TFieldValues>
  slotProps?: {
    helperText?: ComponentProps<'p'>
    label?: ComponentProps<'label'>
    wrapper?: ComponentProps<'div'>
  }
  tooltip?: string
}
