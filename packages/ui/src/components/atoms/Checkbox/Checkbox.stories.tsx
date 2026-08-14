import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { Checkbox, CheckboxProps } from './Checkbox'
import { sizes, states } from '../data'

const meta: Meta<CheckboxProps> = {
  title: 'atoms/Checkbox',
  component: Checkbox,
  parameters: {
    docs: { description: { component: 'The Lamb Checkbox component' } }
  },
  args: {
    disabled: false,
    helperText: 'Você pode alterar isso quando quiser',
    indeterminate: false,
    label: 'Aceito os termos de uso'
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label rendered next to the control'
    },
    helperText: {
      control: 'text',
      description: 'Helper text rendered below the control/label row'
    },
    indeterminate: {
      control: 'boolean',
      description:
        'Renders the dash ("mixed selection") glyph instead of the checkmark, taking precedence over `checked`',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    disabled: {
      control: 'boolean',
      description:
        'Overrides `state` entirely with a flat neutral-67 look and blocks toggling',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
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
    checked: {
      control: 'boolean',
      description: 'Controlled checked value'
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Uncontrolled initial checked value'
    }
  }
}

export default meta

// Interactive (uncontrolled) default — the control's own `defaultChecked`
// drives it, so clicking it in the Storybook canvas actually toggles.
export const Default: StoryObj<CheckboxProps> = {}

export const Checked: StoryObj<CheckboxProps> = {
  args: { defaultChecked: true }
}

export const Indeterminate: StoryObj<CheckboxProps> = {
  args: { indeterminate: true }
}

export const Error: StoryObj<CheckboxProps> = {
  args: {
    state: 'error',
    label: 'Aceito os termos de uso',
    helperText: 'Você precisa aceitar os termos para continuar'
  }
}

export const Success: StoryObj<CheckboxProps> = {
  args: {
    state: 'success',
    defaultChecked: true,
    label: 'Aceito os termos de uso',
    helperText: 'Termos aceitos com sucesso'
  }
}

export const Disabled: StoryObj<CheckboxProps> = {
  args: {
    disabled: true,
    helperText: undefined
  }
}

export const DisabledChecked: StoryObj<CheckboxProps> = {
  args: {
    disabled: true,
    defaultChecked: true,
    helperText: undefined
  }
}

export const NoLabelOrHelperText: StoryObj<CheckboxProps> = {
  args: { label: undefined, helperText: undefined }
}

export const Sizes: StoryFn<CheckboxProps> = args => (
  <div className="flex flex-col gap-4">
    {sizes.map(size => (
      <Checkbox {...args} key={size} label={`Tamanho ${size}`} size={size} />
    ))}
  </div>
)

export const AllStates: StoryFn<CheckboxProps> = () => (
  <div className="flex flex-col gap-4">
    {states.map(state => (
      <div className="flex gap-6" key={state}>
        <Checkbox helperText={undefined} label={state} state={state} />
        <Checkbox
          defaultChecked
          helperText={undefined}
          label={`${state} (checado)`}
          state={state}
        />
      </div>
    ))}
  </div>
)

// A controlled example demonstrating the "select all" -> indeterminate
// pattern indeterminate is meant for (spec.md User Story 3).
export const SelectAllGroup: StoryFn<CheckboxProps> = () => {
  const [items, setItems] = useState([false, true, false])
  const allChecked = items.every(Boolean)
  const someChecked = items.some(Boolean)

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={allChecked}
        indeterminate={someChecked && !allChecked}
        label="Selecionar todos"
        onCheckedChange={next => setItems(items.map(() => next))}
      />
      <div className="flex flex-col gap-2 pl-6">
        {items.map((checked, index) => (
          <Checkbox
            checked={checked}
            key={index}
            label={`Item ${index + 1}`}
            onCheckedChange={next =>
              setItems(items.map((item, i) => (i === index ? next : item)))
            }
          />
        ))}
      </div>
    </div>
  )
}
