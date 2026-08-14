'use client'

import {
  forwardRef,
  ReactElement,
  Ref,
  RefAttributes,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import { Field } from '@church/ui/atoms/Field'
import { Icon } from '@church/ui/atoms/Icon'
import { FieldHelperText, Label } from '@church/ui/atoms/TextField/components'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv } from '@church/ui/lib/tailwind-variants'
import {
  blockReason,
  DatePicker,
  fromISO,
  toISO
} from '@church/ui/molecules/DatePicker'
import type { ISODate } from '@church/ui/molecules/DatePicker'
import { BottomSheet } from '@church/ui/organisms/BottomSheet'
import {
  FIELD_ICON_COLOR,
  fieldActionButton,
  fieldWrapper,
  mergeRefs,
  resolveViewport
} from '@church/ui/utils'
import { FORMAT_HINT, formatISO, maskBR, parseBR } from './data'
import { DateFieldProps } from './DateField.types'

const dateField = tv({
  slots: {
    anchor: 'relative',
    popover: [
      'absolute top-full left-0 z-30 mt-1 p-4',
      'rounded-2xl border border-default bg-surface shadow-elevation-low-bottom-12'
    ],
    sheetPicker: 'max-w-none'
  }
})

type OpenAs = 'popover' | 'sheet' | null

type DateFieldBaseProps = Omit<DateFieldProps, 'control' | 'name' | 'rules'> & {
  fieldName?: string
  inputRef?: Ref<HTMLInputElement>
}

const DateFieldBase = ({
  className,
  defaultValue = null,
  disabled = false,
  disabledDates,
  fieldName,
  helperText,
  id,
  inputRef,
  label,
  max,
  min,
  onBlur,
  onChange,
  onKeyDown,
  optional = false,
  presentation = 'auto',
  shortcuts,
  size = 'medium',
  slotProps,
  state = 'default',
  tooltip,
  value,
  yearRange,
  ...inputProps
}: DateFieldBaseProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = slotProps?.helperText?.id ?? `${inputId}-helper`
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const dirty = useRef(false)
  const refocus = useRef(false)

  const isControlled = value !== undefined
  const [ownValue, setOwnValue] = useState<ISODate | null>(defaultValue)
  const current = isControlled ? value : ownValue
  const [text, setText] = useState(() => formatISO(current))
  const [synced, setSynced] = useState(current)
  const [localError, setLocalError] = useState<string | null>(null)
  const [openAs, setOpenAs] = useState<OpenAs>(null)
  const open = openAs !== null

  // invariant: a new value (prop, form or own) rewrites the text; typing
  // alone never does (React's "adjust state on prop change" pattern).
  if (synced !== current) {
    setSynced(current)
    setText(formatISO(current))
    setLocalError(null)
  }

  // why: the button takes focus back after the sheet unmounts, whose own
  // cleanup would otherwise restore focus to the input it opened from.
  useEffect(() => {
    if (open || !refocus.current) return
    refocus.current = false
    buttonRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (openAs !== 'popover') return
    popoverRef.current
      ?.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]')
      ?.focus()
    const closeOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setOpenAs(null)
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [openAs])

  const commit = (iso: ISODate | null) => {
    setLocalError(null)
    if (iso === current) return
    if (!isControlled) setOwnValue(iso)
    onChange?.(iso)
  }

  const validate = (raw: string) => {
    dirty.current = false
    if (!raw) {
      commit(null)
      return
    }
    const parsed = parseBR(raw)
    if ('error' in parsed) {
      setLocalError(parsed.error)
      return
    }
    const reason = blockReason(
      parsed.date,
      fromISO(min),
      fromISO(max),
      disabledDates
    )
    if (reason) {
      setLocalError(`${reason}.`)
      return
    }
    commit(toISO(parsed.date))
  }

  const openCalendar = () => {
    if (disabled) return
    setOpenAs(
      presentation === 'auto'
        ? resolveViewport(rootRef.current) === 'mobile'
          ? 'sheet'
          : 'popover'
        : presentation
    )
  }

  const closeCalendar = (focusButton: boolean) => {
    setOpenAs(null)
    refocus.current = focusButton
  }

  const pick = (iso: ISODate) => {
    dirty.current = false
    setText(formatISO(iso))
    commit(iso)
    closeCalendar(true)
  }

  const externalError = state === 'error'
  const hasHelperText = helperText != null && helperText !== ''
  const showError = externalError || localError !== null
  const currentState = showError ? 'error' : state
  // invariant: an external error (prop or form) wins over the local one.
  const helperMessage = () => {
    if (externalError && hasHelperText) return helperText
    if (showError) return localError ?? FORMAT_HINT
    if (!hasHelperText) return FORMAT_HINT
    return (
      <>
        {helperText} {FORMAT_HINT}
      </>
    )
  }
  const isRequired = Boolean(label) && !optional
  const slots = dateField()

  const picker = (className?: string) => (
    <DatePicker
      className={className}
      disabledDates={disabledDates}
      label={label}
      max={max}
      min={min}
      onChange={pick}
      shortcuts={shortcuts}
      value={current}
      yearRange={yearRange}
    />
  )

  return (
    <div
      {...slotProps?.wrapper}
      className={twMerge(
        fieldWrapper({ size }),
        className,
        slotProps?.wrapper?.className
      )}
      ref={rootRef}
    >
      {label && (
        <Label
          {...slotProps?.label}
          htmlFor={inputId}
          optional={optional}
          size={size}
          tooltip={tooltip}
        >
          {label}
        </Label>
      )}
      <div className={slots.anchor()}>
        <Field
          autoComplete="off"
          {...inputProps}
          aria-describedby={helperId}
          aria-required={isRequired || undefined}
          disabled={disabled}
          endAdornment={
            <button
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label={`Abrir calendário${label ? ` de ${label}` : ''}`}
              className={fieldActionButton({ size })}
              disabled={disabled}
              onClick={() => (open ? closeCalendar(false) : openCalendar())}
              ref={buttonRef}
              type="button"
            >
              <Icon
                className={FIELD_ICON_COLOR}
                disabled={disabled}
                name="calendar_month"
                size={size}
              />
            </button>
          }
          id={inputId}
          inputMode="numeric"
          maxLength={10}
          name={fieldName}
          onBlur={event => {
            if (dirty.current) validate(text)
            onBlur?.(event)
          }}
          onChange={event => {
            const next = maskBR(event.target.value)
            setText(next)
            dirty.current = true
            if (next.length === 10) validate(next)
            else setLocalError(null)
          }}
          onKeyDown={event => {
            onKeyDown?.(event)
            if (event.key === 'ArrowDown' && event.altKey) {
              event.preventDefault()
              openCalendar()
            } else if (event.key === 'Escape' && open) {
              event.preventDefault()
              event.stopPropagation()
              closeCalendar(true)
            }
          }}
          placeholder="dd/mm/aaaa"
          ref={inputRef}
          size={size}
          state={currentState}
          type="text"
          value={text}
        />
        {openAs === 'popover' && (
          <div
            aria-label={`Escolher ${label || 'data'}`}
            className={slots.popover()}
            onKeyDown={event => {
              if (event.key !== 'Escape') return
              // why: the Esc that closes the calendar must not also close
              // the overlay it sits in (lamb-fields-lists Decided 3).
              event.preventDefault()
              event.stopPropagation()
              closeCalendar(true)
            }}
            ref={popoverRef}
            role="dialog"
          >
            {picker()}
          </div>
        )}
      </div>
      <FieldHelperText
        {...slotProps?.helperText}
        id={helperId}
        size={size}
        state={disabled ? 'default' : currentState}
      >
        {helperMessage()}
      </FieldHelperText>
      {openAs === 'sheet' && (
        <BottomSheet
          onClose={() => closeCalendar(true)}
          open
          title={label || 'Escolher data'}
        >
          {/* why: the App density gives the days their 44px touch target
              even when `presentation="sheet"` opens on a wide window. */}
          <div data-viewport="mobile">{picker(slots.sheetPicker())}</div>
        </BottomSheet>
      )}
    </div>
  )
}

const DateFieldInner = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ control, name, rules, ...props }, ref) => {
    if (!name) return <DateFieldBase {...props} inputRef={ref} />

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <DateFieldBase
            {...props}
            fieldName={field.name}
            helperText={fieldState.error?.message ?? props.helperText}
            inputRef={mergeRefs(field.ref, ref)}
            onBlur={event => {
              field.onBlur()
              props.onBlur?.(event)
            }}
            onChange={next => {
              field.onChange(next)
              props.onChange?.(next)
            }}
            state={fieldState.error ? 'error' : props.state}
            value={typeof field.value === 'string' ? field.value : null}
          />
        )}
        rules={rules}
      />
    )
  }
)
DateFieldInner.displayName = 'DateField'

// why: `forwardRef` erases the generic; this type-only cast restores it so a
// caller's `Control<MySchema>` is inferred end to end, as in TextField.
export const DateField = DateFieldInner as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: DateFieldProps<TFieldValues> & RefAttributes<HTMLInputElement>
) => ReactElement | null
