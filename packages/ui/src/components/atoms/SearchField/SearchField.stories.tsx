import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'
import { SearchField, SearchFieldProps } from './SearchField'
import { sizes } from '../data'

const meta: Meta<SearchFieldProps> = {
  title: 'atoms/SearchField',
  component: SearchField,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13625-7806&m=dev'
    },
    docs: { description: { component: 'The Lamb SearchField component' } }
  },
  args: {
    defaultValue: '',
    disabled: false,
    helperText: '',
    label: 'Buscar',
    name: '',
    placeholder: 'Busque por nome, telefone...',
    size: 'medium'
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label associated with the search input'
    },
    helperText: {
      control: 'text',
      description:
        'Helper text shown below the search input; also filled by the validation error message when bound to a form via `name`/`control`',
      table: {
        type: { summary: 'ReactNode' }
      }
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the search input is empty'
    },
    defaultValue: {
      control: 'text',
      description: 'Uncontrolled initial value of the search input'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
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
        'Per-slot prop overrides for the clear button, wrapper, label, and helper text elements',
      table: {
        type: { summary: '{ clearButton?, helperText?, label?, wrapper? }' }
      }
    },
    startAdornment: {
      control: false,
      description:
        'An optional icon to be rendered at the start of the field. Defaults to a search icon',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    endAdornment: {
      control: false,
      description:
        'Internally overridden by SearchField to render the clear button once there is a value',
      table: {
        type: { summary: 'ReactElement<IconProps>' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the search field',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      }
    }
  }
}

export default meta

export const Default: StoryObj<SearchFieldProps> = {}

export const Small: StoryObj<SearchFieldProps> = {
  args: { size: 'small' }
}

export const Large: StoryObj<SearchFieldProps> = {
  args: { size: 'large' }
}

export const Filled: StoryObj<SearchFieldProps> = {
  args: { defaultValue: 'nome qualquer' }
}

export const Disabled: StoryObj<SearchFieldProps> = {
  args: { disabled: true, defaultValue: 'Campo desabilitado' }
}

export const WithReactHookForm: StoryFn<SearchFieldProps> = args => {
  const { control } = useForm({ defaultValues: { search: '' } })

  return (
    <SearchField
      {...args}
      name="search"
      control={control}
      rules={{ required: 'Digite algo para buscar' }}
    />
  )
}
