import { ChangeEvent, createContext, useContext } from 'react'

export type RadioSize = 'small' | 'medium' | 'large'

// invariant: provided by `@church/ui/molecules/RadioGroup`; `null` means a
// lone Radio, which keeps its own `name`, `checked` and `size`.
export type RadioGroupContextValue = {
  name: string
  value: string | null
  size: RadioSize
  disabled: boolean
  invalid: boolean
  variant: 'default' | 'card'
  select: (value: string, event: ChangeEvent<HTMLInputElement>) => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null
)

export const useRadioGroup = () => useContext(RadioGroupContext)
