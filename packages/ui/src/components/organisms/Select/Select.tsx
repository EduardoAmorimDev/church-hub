'use client'

import {
  KeyboardEvent,
  ReactElement,
  Ref,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { FieldHelperText, Label } from '@church/ui/atoms/TextField/components'
import { twMerge } from '@church/ui/lib/tailwind-merge'
import { tv } from '@church/ui/lib/tailwind-variants'
import { BottomSheet } from '@church/ui/organisms/BottomSheet'
import {
  FIELD_ICON_COLOR,
  fieldActionButton,
  fieldControl,
  fieldWrapper,
  mergeRefs,
  resolveViewport
} from '@church/ui/utils'
import {
  enabledIndex,
  matchesQuery,
  normalize,
  OPTION_DENSITY,
  TYPEAHEAD_RESET_MS
} from './data'
import { SelectOption, SelectProps } from './Select.types'

const select = tv({
  slots: {
    anchor: 'relative',
    box: [
      'flex items-center gap-2',
      'has-[[role=combobox]:focus-visible]:outline-2 has-[[role=combobox]:focus-visible]:outline-offset-2 has-[[role=combobox]:focus-visible]:outline-focus-ring'
    ],
    trigger: 'flex min-w-0 flex-1 items-center gap-2 self-stretch outline-none',
    value: 'min-w-0 flex-1 truncate',
    chevron: 'transition-transform duration-150 ease-out',
    popover: [
      'absolute inset-x-0 top-full z-30 mt-1 flex max-h-86 min-w-0 flex-col overflow-hidden p-1',
      'rounded-2xl border border-default bg-surface shadow-elevation-low-bottom-12'
    ],
    list: 'm-0 list-none overflow-y-auto p-0',
    search: 'flex items-center gap-2 px-3 py-2 text-secondary',
    searchInput: [
      'min-w-0 flex-1 border-0 bg-transparent p-0 outline-none',
      'text-size-75 font-normal text-primary placeholder:text-secondary'
    ],
    empty: [
      'flex flex-col items-start gap-2 p-3',
      'text-size-50 leading-5 font-normal text-secondary'
    ],
    sheetBody: 'flex flex-col gap-1'
  },
  variants: {
    size: {
      small: { box: 'h-8 rounded-lg px-3 py-1.5 text-size-50' },
      medium: { box: 'h-12 rounded-xl px-3.5 py-3 text-size-75' },
      large: { box: 'h-14 rounded-2xl px-4.5 py-3.5 text-size-100' }
    },
    placeholder: {
      true: { value: 'text-secondary' },
      false: { value: 'text-primary' }
    },
    disabled: {
      true: { box: 'cursor-not-allowed', value: 'text-disabled' },
      false: { box: 'cursor-pointer' }
    },
    open: {
      true: {
        box: 'border-focus-ring ring-1 ring-focus-ring',
        chevron: 'rotate-180'
      },
      false: {}
    },
    sheet: {
      true: {
        list: 'max-h-none',
        search: [
          'sticky -top-2 z-1 mb-2 min-h-12 rounded-xl border border-control bg-surface',
          'focus-within:border-focus-ring focus-within:ring-1 focus-within:ring-focus-ring'
        ]
      },
      false: {
        list: 'max-h-72',
        search: [
          'relative mb-1 border-b border-default',
          'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-focus-ring',
          'after:opacity-0 focus-within:after:opacity-100'
        ]
      }
    }
  }
})

// invariant: `selected` comes after `active`, so a selected option that is
// also active keeps `bg-selected` under the focus outline (Lamb's cascade).
const selectOption = tv({
  base: 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium',
  variants: {
    sheet: {
      true: 'min-h-12 text-size-75',
      false: [OPTION_DENSITY, 'text-size-50']
    },
    disabled: {
      true: 'cursor-not-allowed text-disabled',
      false: 'cursor-pointer text-primary'
    },
    active: {
      true: 'bg-hover outline-2 -outline-offset-2 outline-focus-ring',
      false: ''
    },
    selected: { true: 'bg-selected', false: '' }
  }
})

type OpenAs = 'popover' | 'sheet' | null

type SelectBaseProps = Omit<SelectProps, 'control' | 'name' | 'rules'> & {
  onBlur?: () => void
  triggerRef?: Ref<HTMLDivElement>
}

const filterOptions = (
  options: SelectOption[],
  searchable: boolean,
  query: string
) =>
  searchable && query
    ? options.filter(option => matchesQuery(option, query))
    : options

const SelectBase = ({
  className,
  clearable = false,
  defaultOpen = false,
  defaultValue = null,
  disabled = false,
  helperText,
  id,
  label,
  onBlur,
  onChange,
  optional = false,
  options,
  placeholder = 'Selecione',
  presentation = 'auto',
  searchable = false,
  searchPlaceholder = 'Buscar',
  size = 'medium',
  slotProps,
  state = 'default',
  tooltip,
  triggerRef,
  value
}: SelectBaseProps) => {
  const generatedId = useId()
  const baseId = id ?? generatedId
  const labelId = slotProps?.label?.id ?? `${baseId}-label`
  const valueId = `${baseId}-value`
  const listId = `${baseId}-listbox`
  const helperId = slotProps?.helperText?.id ?? `${baseId}-helper`
  const optionId = (option: SelectOption) =>
    `${baseId}-option-${options.indexOf(option)}`

  const rootRef = useRef<HTMLDivElement>(null)
  const localTriggerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const typed = useRef({ text: '', at: 0 })
  const refocus = useRef(false)
  const onBlurRef = useRef(onBlur)
  const startOpen = !disabled && defaultOpen
  // why: `defaultOpen` with `auto` opens as a popover in the first render and
  // decides App or Painel right after mount, before paint (criterion 23).
  const resolveOnMount = useRef(startOpen && presentation === 'auto')

  const isControlled = value !== undefined
  const [ownValue, setOwnValue] = useState<string | null>(defaultValue)
  const current = isControlled ? value : ownValue
  const [openAs, setOpenAs] = useState<OpenAs>(() =>
    startOpen ? (presentation === 'sheet' ? 'sheet' : 'popover') : null
  )
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(() => {
    const selectedIndex = options.findIndex(option => option.value === current)
    return selectedIndex >= 0 ? selectedIndex : enabledIndex(options, 0, 1)
  })

  const open = openAs !== null
  const sheet = openAs === 'sheet'
  const filtered = useMemo(
    () => filterOptions(options, searchable, query),
    [options, query, searchable]
  )
  const selected = options.find(option => option.value === current) ?? null
  const activeOption = open ? filtered[active] : undefined
  const activeId = activeOption ? optionId(activeOption) : undefined

  useEffect(() => {
    onBlurRef.current = onBlur
  })

  useLayoutEffect(() => {
    if (!resolveOnMount.current) return
    resolveOnMount.current = false
    if (resolveViewport(rootRef.current) === 'mobile') setOpenAs('sheet')
  }, [])

  // why: the trigger takes focus back after the sheet unmounts, whose own
  // cleanup would otherwise restore focus to wherever it opened from.
  useEffect(() => {
    if (open || !refocus.current) return
    refocus.current = false
    localTriggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (openAs !== 'popover') return
    const closeOutside = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpenAs(null)
        setQuery('')
        onBlurRef.current?.()
      }
    }
    document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [openAs])

  useEffect(() => {
    if (openAs !== 'popover' || !searchable) return
    const input = searchRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }, [openAs, searchable])

  useEffect(() => {
    if (!open || !activeId) return
    const node = document.getElementById(activeId)
    if (node && typeof node.scrollIntoView === 'function')
      node.scrollIntoView({ block: 'nearest' })
  }, [open, activeId])

  const openList = (initialQuery = '') => {
    if (disabled) return
    const as =
      presentation === 'auto'
        ? resolveViewport(rootRef.current) === 'mobile'
          ? 'sheet'
          : 'popover'
        : presentation
    const list = filterOptions(options, searchable, initialQuery)
    const selectedIndex = list.findIndex(option => option.value === current)
    setOpenAs(as)
    setQuery(initialQuery)
    setActive(
      !initialQuery && selectedIndex >= 0
        ? selectedIndex
        : enabledIndex(list, 0, 1)
    )
  }

  const closeList = (focusTrigger: boolean) => {
    setOpenAs(null)
    setQuery('')
    refocus.current = focusTrigger
    onBlur?.()
  }

  const choose = (option: SelectOption | undefined) => {
    if (!option || option.disabled) return
    if (!isControlled) setOwnValue(option.value)
    onChange?.(option.value, option)
    closeList(true)
  }

  const clear = () => {
    if (!isControlled) setOwnValue(null)
    onChange?.(null, null)
    localTriggerRef.current?.focus()
  }

  const changeQuery = (next: string) => {
    setQuery(next)
    setActive(enabledIndex(filterOptions(options, searchable, next), 0, 1))
  }

  const typeahead = (key: string) => {
    const now = Date.now()
    const text =
      now - typed.current.at >= TYPEAHEAD_RESET_MS
        ? key
        : typed.current.text + key
    typed.current = { text, at: now }
    const index = filtered.findIndex(
      option =>
        !option.disabled && normalize(option.label).startsWith(normalize(text))
    )
    if (index >= 0) setActive(index)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    const { key } = event
    const printable =
      key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault()
        openList()
      } else if (searchable && printable) {
        event.preventDefault()
        openList(key)
      }
      return
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault()
      const next =
        key === 'ArrowDown'
          ? enabledIndex(filtered, active + 1, 1)
          : enabledIndex(filtered, active - 1, -1)
      if (next >= 0) setActive(next)
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault()
      setActive(
        key === 'Home'
          ? enabledIndex(filtered, 0, 1)
          : enabledIndex(filtered, filtered.length - 1, -1)
      )
    } else if (key === 'Enter' || (key === ' ' && !searchable)) {
      event.preventDefault()
      choose(filtered[active])
    } else if (key === 'Escape') {
      // why: the Esc that closes the list must not also close the overlay
      // (Dialog, Drawer) the Select sits in (lamb-fields-lists Decided 3).
      event.preventDefault()
      event.stopPropagation()
      closeList(true)
    } else if (key === 'Tab' && !sheet) {
      // why: Tab then leaves from the trigger, as if the list never opened.
      closeList(false)
      localTriggerRef.current?.focus()
    } else if (!searchable && printable) {
      typeahead(key)
    }
  }

  const slots = select({
    disabled,
    open,
    placeholder: !selected,
    sheet,
    size
  })
  const isRequired = Boolean(label) && !optional
  const hasHelperText = helperText != null && helperText !== ''
  const listKeyboard = sheet && !searchable

  const listContent = (
    <>
      {searchable && (
        <div className={slots.search()}>
          <Icon className="text-current" name="search" size="medium" />
          <input
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded="true"
            aria-label={`Buscar em ${label || 'opções'}`}
            className={slots.searchInput()}
            data-autofocus={sheet ? '' : undefined}
            onChange={event => changeQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            ref={searchRef}
            role="combobox"
            type="text"
            value={query}
          />
        </div>
      )}
      {searchable && query && filtered.length === 0 ? (
        <div className={slots.empty()} role="status">
          <span>{`Nenhum resultado para “${query}”`}</span>
          <Button
            color="neutral"
            onClick={() => {
              changeQuery('')
              searchRef.current?.focus()
            }}
            size="small"
            variant="transparent"
          >
            Limpar busca
          </Button>
        </div>
      ) : (
        <ul
          aria-activedescendant={listKeyboard ? activeId : undefined}
          aria-label={label ? undefined : 'Opções'}
          aria-labelledby={label ? labelId : undefined}
          className={slots.list()}
          data-autofocus={listKeyboard ? '' : undefined}
          id={listId}
          onKeyDown={listKeyboard ? onKeyDown : undefined}
          role="listbox"
          tabIndex={listKeyboard ? 0 : undefined}
        >
          {filtered.map((option, index) => {
            const isSelected = option.value === current
            const isActive = index === active
            return (
              <li
                aria-disabled={option.disabled || undefined}
                aria-selected={isSelected}
                className={selectOption({
                  active: isActive,
                  disabled: Boolean(option.disabled),
                  selected: isSelected,
                  sheet
                })}
                data-active={isActive || undefined}
                id={optionId(option)}
                key={option.value}
                onClick={() => choose(option)}
                onMouseDown={event => event.preventDefault()}
                onMouseMove={() => {
                  if (!option.disabled && !isActive) setActive(index)
                }}
                role="option"
              >
                {option.iconName && (
                  <Icon
                    className="text-current"
                    name={option.iconName}
                    size="medium"
                  />
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-size-25 text-secondary font-normal">
                      {option.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Icon className="text-primary" name="check" size="medium" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
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
          id={labelId}
          onClick={() => localTriggerRef.current?.focus()}
          optional={optional}
          size={size}
          tooltip={tooltip}
        >
          {label}
        </Label>
      )}
      <div className={slots.anchor()}>
        <div
          className={twMerge(fieldControl({ disabled, state }), slots.box())}
          data-open={open || undefined}
        >
          <div
            aria-activedescendant={
              openAs === 'popover' && !searchable ? activeId : undefined
            }
            aria-controls={listId}
            aria-describedby={hasHelperText ? helperId : undefined}
            aria-disabled={disabled || undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={state === 'error' || undefined}
            aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
            aria-required={isRequired || undefined}
            className={slots.trigger()}
            id={baseId}
            onClick={() => (open ? closeList(false) : openList())}
            onKeyDown={onKeyDown}
            ref={mergeRefs(localTriggerRef, triggerRef)}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
          >
            {selected?.iconName && (
              <Icon
                className={FIELD_ICON_COLOR}
                disabled={disabled}
                name={selected.iconName}
                size={size}
              />
            )}
            <span className={slots.value()} id={valueId}>
              {selected ? selected.label : placeholder}
            </span>
          </div>
          {clearable && selected && !disabled && (
            <button
              aria-label={`Limpar ${label || 'seleção'}`}
              className={fieldActionButton({ size })}
              onClick={clear}
              type="button"
            >
              <Icon className={FIELD_ICON_COLOR} name="close" size={size} />
            </button>
          )}
          <Icon
            className={twMerge(FIELD_ICON_COLOR, slots.chevron())}
            disabled={disabled}
            name="expand_more"
            size={size}
          />
        </div>
        {openAs === 'popover' && (
          <div className={slots.popover()}>{listContent}</div>
        )}
      </div>
      {hasHelperText && (
        <FieldHelperText
          {...slotProps?.helperText}
          id={helperId}
          size={size}
          state={disabled ? 'default' : state}
        >
          {helperText}
        </FieldHelperText>
      )}
      {sheet && (
        <BottomSheet
          detents={options.length > 6 ? 'half' : 'auto'}
          onClose={() => closeList(true)}
          open
          title={label || 'Selecione'}
        >
          <div className={slots.sheetBody()}>{listContent}</div>
        </BottomSheet>
      )}
    </div>
  )
}

const SelectInner = ({ control, name, rules, ...props }: SelectProps) => {
  if (!name) return <SelectBase {...props} />

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectBase
          {...props}
          helperText={fieldState.error?.message ?? props.helperText}
          onBlur={field.onBlur}
          onChange={(next, option) => {
            field.onChange(next)
            props.onChange?.(next, option)
          }}
          state={fieldState.error ? 'error' : props.state}
          triggerRef={field.ref}
          value={typeof field.value === 'string' ? field.value : null}
        />
      )}
      rules={rules}
    />
  )
}

// why: the inner component is typed with the base `FieldValues`; this
// type-only cast restores the generic signature so a caller's
// `Control<MySchema>` is inferred end to end, as in TextField.
export const Select = SelectInner as <
  TFieldValues extends FieldValues = FieldValues
>(
  props: SelectProps<TFieldValues>
) => ReactElement | null
