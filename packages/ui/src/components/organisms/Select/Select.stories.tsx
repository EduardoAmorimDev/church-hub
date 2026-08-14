import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'
import { Button } from '@church/ui/atoms/Button'
import { Select } from './Select'
import { SelectOption, SelectProps } from './Select.types'

// invariant: synthetic data only (constitution, Principle V).
const GCS: SelectOption[] = Array.from({ length: 12 }, (_, index) => ({
  value: `gc-${index + 1}`,
  label: `GC Exemplo ${index + 1}`,
  description: `Rede Exemplo ${(index % 3) + 1}`
}))

const CARGOS: SelectOption[] = [
  { value: 'lider', label: 'Líder de GC', iconName: 'groups' },
  {
    value: 'mentor',
    label: 'Mentor',
    iconName: 'school',
    description: 'Acompanha uma rede'
  },
  { value: 'anfitriao', label: 'Anfitrião', iconName: 'home' },
  { value: 'louvor', label: 'Louvor', iconName: 'music_note' },
  { value: 'kids', label: 'Kids', iconName: 'child_care', disabled: true },
  { value: 'apoio', label: 'Apoio', iconName: 'volunteer_activism' }
]

const Render = (args: SelectProps) => {
  const [value, setValue] = useState<string | null>(args.value ?? null)
  return <Select {...args} onChange={next => setValue(next)} value={value} />
}

type FormValues = { gc: string | null }

const FormRender = (args: SelectProps) => {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { gc: null }
  })
  return (
    <form
      className="flex max-w-80 flex-col gap-4"
      onSubmit={handleSubmit(() => undefined)}
    >
      <Select
        {...args}
        control={control}
        name="gc"
        rules={{ required: 'Escolha um GC.' }}
      />
      <Button type="submit">Salvar</Button>
    </form>
  )
}

export default {
  title: 'organisms/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Select`: a single choice among 6 or more options, with optional search that ignores accents. A field of the TextField family (`label`, `helperText`, `state`, `optional`, `size`, react-hook-form `control`/`name`/`rules`). It opens as a popover in Painel and as a BottomSheet in App, decided when it opens; the closed field never depends on the window width. It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  render: Render,
  args: {
    clearable: false,
    disabled: false,
    helperText: 'Só GCs da sua rede.',
    label: 'GC',
    optional: false,
    options: GCS,
    presentation: 'auto',
    searchable: true,
    size: 'medium',
    state: 'default'
  },
  argTypes: {
    presentation: {
      control: 'select',
      options: ['auto', 'popover', 'sheet'],
      table: { defaultValue: { summary: 'auto' } }
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: { defaultValue: { summary: 'medium' } }
    },
    state: {
      control: 'select',
      options: ['default', 'error', 'success'],
      table: { defaultValue: { summary: 'default' } }
    },
    placeholder: { table: { defaultValue: { summary: 'Selecione' } } },
    searchPlaceholder: { table: { defaultValue: { summary: 'Buscar' } } },
    options: { control: false },
    control: { control: false },
    rules: { control: false },
    slotProps: { control: false }
  }
} as Meta<SelectProps>

export const Default: StoryObj<SelectProps> = {}

export const WithIcons: StoryObj<SelectProps> = {
  args: {
    clearable: true,
    helperText: undefined,
    label: 'Cargo',
    options: CARGOS,
    searchable: false
  }
}

export const Error: StoryObj<SelectProps> = {
  args: { helperText: 'Escolha um GC.', state: 'error' }
}

export const Disabled: StoryObj<SelectProps> = {
  args: { disabled: true, value: 'gc-2' }
}

export const Sheet: StoryObj<SelectProps> = {
  args: { presentation: 'sheet' }
}

export const ReactHookForm: StoryObj<SelectProps> = {
  render: FormRender,
  args: { helperText: undefined }
}
