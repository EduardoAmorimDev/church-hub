import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../Button'
import { TextArea, TextAreaProps } from './TextArea'
import { states } from '../data'

const meta: Meta<TextAreaProps> = {
  title: 'atoms/TextArea',
  component: TextArea,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13607-3107&m=dev'
    },
    docs: { description: { component: 'The Lamb TextArea component' } }
  },
  args: {
    defaultValue: '',
    disabled: false,
    helperText: '',
    label: 'Observações',
    maxLength: 120,
    name: '',
    optional: false,
    placeholder: 'Escreva suas observações aqui...',
    tooltip: ''
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the textarea'
    },
    helperText: {
      control: 'text',
      description:
        'Helper text shown below the textarea; replaced by the validation error message when bound to a form via `name`/`control`',
      table: {
        type: { summary: 'ReactNode' }
      }
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the textarea is empty'
    },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled initial value of the textarea'
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
    maxLength: {
      control: 'number',
      description:
        'Maximum character count. When set, renders a live, politely announced "current/max caracteres" counter right-aligned below the text',
      table: {
        type: { summary: 'number' }
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
        'Per-slot prop overrides for the counter, wrapper, label, root, and helper text elements',
      table: {
        type: {
          summary:
            '{ counter?, helperText?, label?, root?, textarea?, wrapper? }'
        }
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

export const Optional: StoryObj<TextAreaProps> = {
  args: { label: 'Comentário', optional: true }
}

export const WithTooltip: StoryObj<TextAreaProps> = {
  args: { tooltip: 'Visível apenas para a equipe interna' }
}

export const WithCounter: StoryObj<TextAreaProps> = {
  args: { defaultValue: 'Escrevendo...' }
}

export const WithReactHookForm: StoryFn<TextAreaProps> = args => {
  const { control } = useForm({ defaultValues: { observations: '' } })

  return (
    <TextArea
      {...args}
      name="observations"
      control={control}
      rules={{ required: 'Observações são obrigatórias' }}
    />
  )
}

type FeedbackFormValues = { feedback: string }

export const WithSubmitButton: StoryFn = () => {
  const [submittedValues, setSubmittedValues] =
    useState<FeedbackFormValues | null>(null)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FeedbackFormValues>({ defaultValues: { feedback: '' } })

  const onSubmit = handleSubmit(values => {
    setSubmittedValues(values)
  })

  return (
    <form className="flex w-80 flex-col gap-4" onSubmit={onSubmit} noValidate>
      <TextArea
        control={control}
        label="Feedback"
        name="feedback"
        placeholder="Conte o que podemos melhorar..."
        rules={{ required: 'Feedback é obrigatório' }}
      />
      <Button disabled={isSubmitting} type="submit">
        Enviar
      </Button>
      {submittedValues && (
        <pre className="bg-neutral-06 text-size-50 text-neutral-83 rounded-lg p-3">
          {JSON.stringify(submittedValues, null, 2)}
        </pre>
      )}
    </form>
  )
}
WithSubmitButton.storyName = 'Form with Submit Button (React Hook Form)'
