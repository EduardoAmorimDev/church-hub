import type { Meta, StoryObj } from '@storybook/nextjs'
import { Avatar } from '@church/ui/atoms/Avatar'
import { Checkbox } from '@church/ui/atoms/Checkbox'
import { CountBadge } from '@church/ui/atoms/CountBadge'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { ListItem, ListItemProps } from './ListItem'

export default {
  title: 'molecules/ListItem',
  component: ListItem,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `ListItem`: a list row with leading, title, subtitle and trailing. With `href` or `onClick` the whole row is the link or button; `action` sits beside it. Created in Lamb, no Figma node.'
      }
    }
  },
  decorators: [
    Story => (
      <ul className="bg-surface m-0 flex max-w-120 list-none flex-col p-0">
        <Story />
      </ul>
    )
  ],
  args: {
    density: 'default',
    divider: true,
    subtitle: '12 presentes',
    title: 'Relatório de 01/10'
  },
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'default', 'comfortable'],
      table: { defaultValue: { summary: 'default' } }
    },
    as: { control: 'select', options: ['a', 'button', 'label', 'div'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    divider: { control: 'boolean' },
    chevron: { control: 'boolean' }
  }
} as Meta<ListItemProps>

export const Default: StoryObj<ListItemProps> = {
  args: { leading: <Icon name="description" /> }
}

export const Link: StoryObj<ListItemProps> = {
  args: {
    href: '#',
    leading: <Icon name="description" />,
    trailing: <CountBadge count={2} label="2 pendências" />
  }
}

export const People: StoryObj<ListItemProps> = {
  render: args => (
    <>
      <ListItem
        {...args}
        leading={
          <Avatar alt="Pessoa Fictícia" decorative size="medium" src="" />
        }
        onClick={() => undefined}
        subtitle="Grupo Exemplo"
        title="Pessoa Fictícia"
      />
      <ListItem
        {...args}
        action={
          <IconButton
            aria-label="Mais opções"
            color="neutral"
            size="small"
            variant="transparent"
          >
            <Icon name="more_vert" />
          </IconButton>
        }
        leading={<Avatar alt="Outra Pessoa" decorative size="medium" src="" />}
        onClick={() => undefined}
        selected
        subtitle="Grupo Exemplo"
        title="Outra Pessoa"
      />
      <ListItem
        {...args}
        disabled
        href="#"
        leading={
          <Avatar alt="Terceira Pessoa" decorative size="medium" src="" />
        }
        subtitle="Grupo Exemplo"
        title="Terceira Pessoa"
      />
    </>
  )
}

export const CheckboxRow: StoryObj<ListItemProps> = {
  args: {
    as: 'label',
    leading: <Checkbox aria-label="Pessoa Fictícia" />,
    subtitle: 'Grupo Exemplo',
    title: 'Pessoa Fictícia'
  }
}
