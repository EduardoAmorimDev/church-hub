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
    disabled: false,
    placeholder: 'Placeholder',
    readOnly: false,
    size: 'medium',
    state: 'default',
    type: 'text',
    variant: 'default'
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description:
        'prop that determines whether the input field is disabled or not',
      table: {
        type: { summary: 'boolean' }
      }
    },
    placeholder: {
      control: 'text',
      description: 'The placeholder of the input',
      table: {
        type: { summary: 'string' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the field',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
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
    endAdornment: {
      control: false,
      description:
        'An optional icon to be rendered at the end of the field. The size of the icon will be automatically adjusted based on the field size',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    startAdornment: {
      control: false,
      description:
        'An optional icon to be rendered at the start of the field. The size of the icon will be automatically adjusted based on the field size',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    readOnly: {
      control: 'boolean',
      description:
        'An optional prop that determines whether the input field is solid or editable.',
      table: {
        type: { summary: 'boolean' }
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
  args: { readOnly: true, value: 'Placeholder' }
}
