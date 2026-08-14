import type { Meta, StoryObj } from '@storybook/nextjs'
import { Radio, RadioProps } from './Radio'
import { sizes } from '../data'

export default {
  title: 'atoms/Radio',
  component: Radio,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Radio`. It has no Figma node: the Lamb artifact created it. Use it inside a `RadioGroup`, which gives it the name, value, size and error; a lone Radio rarely makes sense.'
      }
    }
  },
  args: {
    description: 'Nunca participou de um GC ou culto',
    disabled: false,
    label: 'Primeira vez',
    name: 'tipo',
    size: 'medium',
    value: 'primeira'
  },
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      table: { defaultValue: { summary: 'medium' } }
    },
    label: { control: 'text' },
    description: {
      control: 'text',
      description: 'Supporting text under the label, linked by aria-describedby'
    },
    disabled: { control: 'boolean' }
  }
} as Meta<RadioProps>

export const Default: StoryObj<RadioProps> = {}

export const Options: StoryObj<RadioProps> = {
  render: args => (
    <div className="flex flex-col">
      <Radio {...args} defaultChecked />
      <Radio {...args} description={undefined} label="Voltou" value="retorno" />
      <Radio
        {...args}
        description={undefined}
        label="Convidado de membro"
        value="convidado"
      />
    </div>
  )
}

export const Disabled: StoryObj<RadioProps> = { args: { disabled: true } }
