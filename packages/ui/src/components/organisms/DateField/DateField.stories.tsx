import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'
import { Button } from '@church/ui/atoms/Button'
import type { ISODate } from '@church/ui/molecules/DatePicker'
import { DateField } from './DateField'
import { DateFieldProps } from './DateField.types'

const Render = (args: DateFieldProps) => {
  const [value, setValue] = useState<ISODate | null>(args.value ?? null)
  return <DateField {...args} onChange={setValue} value={value} />
}

type FormValues = { data: ISODate | null }

const FormRender = (args: DateFieldProps) => {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { data: null }
  })
  return (
    <form
      className="flex max-w-80 flex-col gap-4"
      onSubmit={handleSubmit(() => undefined)}
    >
      <DateField
        {...args}
        control={control}
        name="data"
        rules={{ required: 'Informe a data.' }}
      />
      <Button type="submit">Salvar</Button>
    </form>
  )
}

export default {
  title: 'organisms/DateField',
  component: DateField,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `DateField`: a single date typed with the `dd/mm/aaaa` mask, validated on blur or at 10 characters, with an optional calendar (the DatePicker) in a popover in Painel or a BottomSheet in App, decided when it opens. A field of the TextField family; the value is an `ISODate` or `null`. It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  render: Render,
  args: {
    disabled: false,
    helperText: 'Use a data do encontro.',
    label: 'Data da reunião',
    max: '2026-12-31',
    min: '2026-01-01',
    optional: false,
    presentation: 'auto',
    shortcuts: ['today', 'yesterday'],
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
    min: { control: 'text' },
    max: { control: 'text' },
    control: { control: false },
    rules: { control: false },
    slotProps: { control: false }
  }
} as Meta<DateFieldProps>

export const Default: StoryObj<DateFieldProps> = {}

export const Birthday: StoryObj<DateFieldProps> = {
  args: {
    helperText: undefined,
    label: 'Data de nascimento',
    max: undefined,
    min: undefined,
    optional: true,
    shortcuts: undefined,
    yearRange: [1920, 2026]
  }
}

export const Error: StoryObj<DateFieldProps> = {
  args: { helperText: 'Informe a data.', state: 'error' }
}

export const Disabled: StoryObj<DateFieldProps> = {
  args: { disabled: true, value: '2026-03-15' }
}

export const Sheet: StoryObj<DateFieldProps> = {
  args: { presentation: 'sheet' }
}

export const ReactHookForm: StoryObj<DateFieldProps> = {
  render: FormRender,
  args: { helperText: undefined }
}
