import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../Button'
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
    disabled: false,
    helperText: 'Usaremos esse email para contato',
    label: 'Email',
    name: '',
    optional: false,
    placeholder: 'nome@exemplo.com',
    tooltip: ''
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the input'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    optional: {
      control: 'boolean',
      description:
        'Whether the field is optional. Defaults to false (required), rendering a red asterisk next to the label; when true, renders an "(Opcional)" note instead',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    tooltip: {
      control: 'text',
      description:
        'Tooltip text shown next to the label, on an info icon that triggers it on hover/focus',
      table: {
        type: { summary: 'string' }
      }
    },
    control: {
      control: false,
      description:
        'react-hook-form `Control` instance — required alongside `name` to bind the field to a form',
      table: {
        type: { summary: 'Control<TFieldValues>' }
      }
    },
    rules: {
      control: false,
      description:
        'react-hook-form validation rules, applied through `Controller` when `name` is set',
      table: {
        type: { summary: 'RegisterOptions<TFieldValues>' }
      }
    },
    slotProps: {
      control: false,
      description:
        'Per-slot prop overrides for the wrapper, label, and helper text elements',
      table: {
        type: { summary: '{ helperText?, label?, wrapper? }' }
      }
    },
    startAdornment: {
      control: false,
      description: 'An optional icon to be rendered at the start of the field',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    endAdornment: {
      control: false,
      description: 'An optional icon to be rendered at the end of the field',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
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
    },
    type: {
      control: 'select',
      description: 'The HTML input type of the text field',
      options: ['text', 'password', 'email', 'number', 'tel'],
      table: {
        type: { summary: 'text | password | email | number | tel' },
        defaultValue: { summary: 'text' }
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

export const Optional: StoryObj<TextFieldProps> = {
  args: {
    label: 'Apelido',
    placeholder: 'Como você gostaria de ser chamado?',
    helperText: undefined,
    optional: true
  }
}

export const WithTooltip: StoryObj<TextFieldProps> = {
  args: {
    label: 'CPF',
    placeholder: '000.000.000-00',
    helperText: undefined,
    tooltip: 'Usado apenas para validar sua identidade'
  }
}

export const WithReactHookForm: StoryFn<TextFieldProps> = args => {
  const { control } = useForm({ defaultValues: { email: '' } })

  return (
    <TextField
      {...args}
      name="email"
      control={control}
      rules={{ required: 'Email é obrigatório' }}
    />
  )
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginFormWithZod: StoryFn = () => {
  const [submittedValues, setSubmittedValues] =
    useState<LoginFormValues | null>(null)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = handleSubmit(values => {
    setSubmittedValues(values)
  })

  return (
    <form className="flex w-80 flex-col gap-4" onSubmit={onSubmit} noValidate>
      <TextField
        control={control}
        label="Email"
        name="email"
        placeholder="nome@exemplo.com"
      />
      <TextField
        control={control}
        label="Senha"
        name="password"
        placeholder="Digite sua senha"
        type="password"
      />
      <Button disabled={isSubmitting} type="submit">
        Entrar
      </Button>
      {submittedValues && (
        <pre className="bg-neutral-06 text-size-50 text-neutral-83 rounded-lg p-3">
          {JSON.stringify(submittedValues, null, 2)}
        </pre>
      )}
    </form>
  )
}
LoginFormWithZod.storyName = 'Login Form with React Hook Form + Zod'
