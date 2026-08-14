import type { Meta, StoryObj } from '@storybook/nextjs'
import { RadioGroup, RadioGroupProps } from './RadioGroup'
import { Radio } from '@church/ui/atoms/Radio'

const options = (
  <>
    <Radio
      description="Nunca participou de um GC ou culto"
      label="Primeira vez"
      value="primeira"
    />
    <Radio
      description="Já esteve conosco antes"
      label="Voltou"
      value="retorno"
    />
    <Radio
      description="Veio a convite de alguém da igreja"
      label="Convidado de membro"
      value="convidado"
    />
  </>
)

export default {
  title: 'molecules/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `RadioGroup`: one choice among 2 to 5 options, with legend, helper text and error. It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  args: {
    children: options,
    defaultValue: 'retorno',
    disabled: false,
    legend: 'Tipo de visitante',
    optional: false,
    orientation: 'vertical',
    size: 'medium',
    variant: 'default'
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: 'vertical' } }
    },
    variant: {
      control: 'select',
      options: ['default', 'card'],
      table: { defaultValue: { summary: 'default' } }
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: { defaultValue: { summary: 'medium' } }
    },
    helperText: { control: 'text' },
    error: { control: 'text' },
    legendHidden: { control: 'boolean' },
    optional: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: false }
  }
} as Meta<RadioGroupProps>

export const Default: StoryObj<RadioGroupProps> = {}

export const WithHelperAndError: StoryObj<RadioGroupProps> = {
  args: {
    defaultValue: undefined,
    error: 'Responda para enviar o relatório.',
    helperText: 'Escolha a opção que melhor descreve a visita.'
  }
}

export const Horizontal: StoryObj<RadioGroupProps> = {
  args: { orientation: 'horizontal' }
}

export const Cards: StoryObj<RadioGroupProps> = {
  args: { variant: 'card' }
}

export const CardGrid: StoryObj<RadioGroupProps> = {
  args: { orientation: 'horizontal', variant: 'card' }
}

export const AppDensity: StoryObj<RadioGroupProps> = {
  render: args => (
    <div data-viewport="mobile">
      <RadioGroup {...args} />
    </div>
  )
}
