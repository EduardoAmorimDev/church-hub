import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { MenuDropdown, MenuDropdownProps } from './MenuDropdown'

export default {
  title: 'molecules/MenuDropdown',
  component: MenuDropdown,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13033-3147&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `MenuDropdown`: an action menu anchored to its trigger. Arrows move between enabled items, Esc closes and returns focus, Tab or a click outside closes. A `destructive` item opens its confirmation afterwards.'
      }
    }
  },
  decorators: [
    Story => (
      <div className="flex min-h-80 justify-center p-4">
        <Story />
      </div>
    )
  ],
  args: {
    align: 'start',
    items: [
      { iconName: 'edit', label: 'Editar' },
      { iconName: 'content_copy', label: 'Duplicar' },
      { active: true, iconName: 'visibility', label: 'Ver detalhes' },
      { disabled: true, iconName: 'share', label: 'Compartilhar' },
      { iconName: 'archive', label: 'Arquivar' },
      { color: 'destructive', iconName: 'delete', label: 'Excluir' }
    ],
    label: 'Ações',
    trigger: (
      <Button color="neutral" size="small" variant="ghost">
        Ações
      </Button>
    )
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'end'],
      table: { defaultValue: { summary: 'start' } }
    },
    side: {
      control: 'select',
      options: ['bottom', 'top'],
      table: { defaultValue: { summary: 'bottom' } }
    },
    label: { control: 'text' },
    trigger: { control: false }
  }
} as Meta<MenuDropdownProps>

export const Default: StoryObj<MenuDropdownProps> = {}

export const MoreOptions: StoryObj<MenuDropdownProps> = {
  args: {
    align: 'end',
    label: 'Mais opções',
    trigger: (
      <IconButton
        aria-label="Mais opções"
        color="neutral"
        size="small"
        variant="transparent"
      >
        <Icon name="more_vert" />
      </IconButton>
    )
  }
}

export const OpensAbove: StoryObj<MenuDropdownProps> = {
  args: { side: 'top' },
  decorators: [
    Story => (
      <div className="flex min-h-80 items-end">
        <Story />
      </div>
    )
  ]
}

export const FixedInsideOverflow: StoryObj<MenuDropdownProps> = {
  args: { align: 'end', strategy: 'fixed' },
  decorators: [
    Story => (
      <div className="border-default h-20 overflow-x-auto rounded-lg border p-2">
        <Story />
      </div>
    )
  ]
}
