import { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react'
import { Control, FieldValues, RegisterOptions } from 'react-hook-form'
import type {
  DatePickerShortcut,
  ISODate
} from '@church/ui/molecules/DatePicker'

export type DateFieldProps<TFieldValues extends FieldValues = FieldValues> =
  Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'children'
    | 'defaultValue'
    | 'inputMode'
    | 'max'
    | 'maxLength'
    | 'min'
    | 'name'
    | 'onChange'
    | 'placeholder'
    | 'size'
    | 'type'
    | 'value'
  > & {
    /** invariant: with `value` (even `null`) the text follows the prop;
     * without it, `defaultValue` seeds an internal date. */
    value?: ISODate | null
    defaultValue?: ISODate | null
    /** invariant: called only with a valid ISO date, or `null` when the
     * field is emptied; invalid text never reaches it. */
    onChange?: (value: ISODate | null) => void
    min?: ISODate
    max?: ISODate
    disabledDates?: (iso: ISODate) => boolean | string
    shortcuts?: DatePickerShortcut[]
    yearRange?: [number, number]
    /** why: `auto` decides Painel (popover) or App (BottomSheet) when the
     * calendar opens, never in render (lamb-fields-lists Decided 1). */
    presentation?: 'auto' | 'popover' | 'sheet'
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
