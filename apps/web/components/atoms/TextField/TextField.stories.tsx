import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { Control, useForm } from 'react-hook-form'
import { Icon } from '../Icon'
import { TextField, TextFieldProps } from './TextField'
import { sizes, states } from '../data'

const meta: Meta<TextFieldProps> = {
  title: 'atoms/TextField',
  component: TextField,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13625-7806&m=dev'
    },
    docs: { description: { component: 'The Lamb TextField component' } }
  },
  args: {
    label: 'Email',
    placeholder: 'nome@exemplo.com',
    helperText: 'Usaremos esse email para contato'
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the input'
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

export const Default: StoryObj<TextFieldProps> = {}

export const Error: StoryObj<TextFieldProps> = {
  args: {
    state: 'error',
    label: 'Email',
    placeholder: 'nome@exemplo.com',
    defaultValue: 'email inválido',
    helperText: 'Email inválido'
  }
}

export const Success: StoryObj<TextFieldProps> = {
  args: {
    state: 'success',
    label: 'Email',
    placeholder: 'nome@exemplo.com',
    defaultValue: 'nome@exemplo.com',
    helperText: undefined
  }
}

export const Disabled: StoryObj<TextFieldProps> = {
  args: {
    disabled: true,
    label: 'Email',
    placeholder: 'nome@exemplo.com',
    defaultValue: 'Campo desabilitado',
    helperText: undefined
  }
}

export const WithAdornments: StoryObj<TextFieldProps> = {
  args: {
    label: 'Telefone',
    placeholder: '(00) 00000-0000',
    helperText: undefined,
    startAdornment: <Icon name="call" />
  }
}

export const Password: StoryObj<TextFieldProps> = {
  args: {
    label: 'Senha',
    placeholder: 'Digite sua senha',
    helperText: undefined,
    type: 'password'
  }
}

export const WithReactHookForm: StoryFn<TextFieldProps> = args => {
  const { control } = useForm({ defaultValues: { email: '' } })

  return (
    <TextField
      {...args}
      name="email"
      control={control as Control<any>}
      rules={{ required: 'Email é obrigatório' }}
    />
  )
}
