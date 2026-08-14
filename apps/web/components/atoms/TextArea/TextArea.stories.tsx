import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { Control, useForm } from 'react-hook-form'
import { TextArea, TextAreaProps } from './TextArea'
import { sizes, states } from '../data'

const meta: Meta<TextAreaProps> = {
  title: 'atoms/TextArea',
  component: TextArea,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13625-7806&m=dev'
    },
    docs: { description: { component: 'The Lamb TextArea component' } }
  },
  args: {
    label: 'Observações',
    placeholder: 'Escreva suas observações aqui...',
    helperText: undefined
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the textarea'
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

export const Default: StoryObj<TextAreaProps> = {}

export const Error: StoryObj<TextAreaProps> = {
  args: {
    state: 'error',
    defaultValue: 'Nome inválido',
    helperText: 'Algo deu errado'
  }
}

export const Success: StoryObj<TextAreaProps> = {
  args: { state: 'success', defaultValue: 'Nome válido' }
}

export const Disabled: StoryObj<TextAreaProps> = {
  args: { disabled: true, defaultValue: 'Campo desabilitado' }
}

export const WithReactHookForm: StoryFn<TextAreaProps> = args => {
  const { control } = useForm({ defaultValues: { observations: '' } })

  return (
    <TextArea
      {...args}
      name="observations"
      control={control as Control<any>}
      rules={{ required: 'Observações são obrigatórias' }}
    />
  )
}
