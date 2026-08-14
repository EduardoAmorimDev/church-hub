import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { Toggle, ToggleProps } from './Toggle'
import { sizes } from '../data'

export default {
  title: 'atoms/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Toggle`. It has no Figma node: the Lamb artifact created it. It applies at once; a change that needs saving or confirming is a Checkbox or a Button.'
      }
    }
  },
  args: {
    color: 'neutral',
    description: 'Push no domingo às 20h se o relatório não foi enviado.',
    disabled: false,
    label: 'Lembrete de relatório',
    labelPosition: 'right',
    loading: false,
    showStateText: false,
    size: 'medium'
  },
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      table: { defaultValue: { summary: 'medium' } }
    },
    color: {
      control: 'inline-radio',
      description: 'Accent only for a highlight the screen asks for',
      options: ['neutral', 'accent'],
      table: { defaultValue: { summary: 'neutral' } }
    },
    labelPosition: {
      control: 'inline-radio',
      options: ['right', 'left'],
      table: { defaultValue: { summary: 'right' } }
    },
    showStateText: {
      control: 'boolean',
      description: 'Shows "Ligado" / "Desligado"'
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
} as Meta<ToggleProps>

export const Default: StoryObj<ToggleProps> = {}

export const On: StoryObj<ToggleProps> = { args: { defaultChecked: true } }

export const SettingsRow: StoryObj<ToggleProps> = {
  args: { labelPosition: 'left', showStateText: true }
}

export const SavesWithPromise: StoryObj<ToggleProps> = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false)
    const save = (next: boolean) =>
      new Promise<void>(resolve => setTimeout(resolve, 1500)).then(() =>
        setChecked(next)
      )
    return <Toggle {...args} checked={checked} onCheckedChange={save} />
  }
}
