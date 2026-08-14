import type { Meta, StoryObj } from '@storybook/nextjs'
import { Field, FieldProps } from './Field'
import { sizes, states, variants } from '../data'

const meta: Meta<FieldProps> = {
  title: 'atoms/Field',
  component: Field,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13625-7806&m=dev'
    },
    docs: { description: { component: 'The Lamb Field component' } }
  },
  args: {
    size: 'medium',
    variant: 'default',
    state: 'default',
    type: 'text',
    placeholder: 'Placeholder',
    disabled: false
  },
  argTypes: {
    size: {
      control: 'select',
      description: 'The size of the field',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    },
    variant: {
      control: 'select',
      description:
        'The visual variant of the field: "default" renders a bordered input, "solid" renders a readonly-style field without border/padding',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'default' }
      }
    },
    state: {
      control: 'select',
      description: 'The validation state of the field',
      options: states,
      table: {
        type: { summary: states.join(' | ') },
        defaultValue: { summary: 'default' }
      }
    },
    type: {
      control: 'select',
      description: 'The HTML input type of the field',
      options: ['text', 'password', 'email', 'number', 'tel'],
      table: {
        type: { summary: 'text | password | email | number | tel' },
        defaultValue: { summary: 'text' }
      }
    }
  }
}

export default meta

export const Default: StoryObj<FieldProps> = {}

export const Error: StoryObj<FieldProps> = {
  args: { state: 'error', value: 'Placeholder' }
}

export const Success: StoryObj<FieldProps> = {
  args: { state: 'success', value: 'Placeholder' }
}

export const Disabled: StoryObj<FieldProps> = {
  args: { disabled: true, value: 'Placeholder' }
}

export const Solid: StoryObj<FieldProps> = {
  args: { variant: 'solid', value: 'Placeholder' }
}
