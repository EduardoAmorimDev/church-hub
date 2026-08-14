import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { Control, useForm } from 'react-hook-form'
import { SearchField, SearchFieldProps } from './SearchField'
import { sizes, states } from '../data'

const meta: Meta<SearchFieldProps> = {
  title: 'atoms/SearchField',
  component: SearchField,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13625-7806&m=dev'
    },
    docs: { description: { component: 'The Lamb SearchField component' } }
  },
  args: {
    label: 'Buscar',
    placeholder: 'Busque por nome, telefone...',
    helperText: undefined
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the search input'
    },
    size: {
      control: 'select',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    state: {
      control: 'select',
      options: states,
      table: {
        type: { summary: states.join(' | ') },
        defaultValue: { summary: 'default' }
      }
    }
  }
}

export default meta

export const Default: StoryObj<SearchFieldProps> = {}

export const Error: StoryObj<SearchFieldProps> = {
  args: {
    state: 'error',
    defaultValue: 'nome qualquer',
    helperText: 'Algo deu errado'
  }
}

export const Success: StoryObj<SearchFieldProps> = {
  args: { state: 'success', defaultValue: 'nome qualquer' }
}

export const Disabled: StoryObj<SearchFieldProps> = {
  args: { disabled: true, defaultValue: 'Campo desabilitado' }
}

export const WithReactHookForm: StoryFn<SearchFieldProps> = args => {
  const { control } = useForm({ defaultValues: { search: '' } })

  return (
    <SearchField
      {...args}
      name="search"
      control={control as Control<any>}
      rules={{ required: 'Digite algo para buscar' }}
    />
  )
}
