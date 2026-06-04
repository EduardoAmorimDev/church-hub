import type { Meta, StoryFn } from '@storybook/nextjs'
import { useState } from 'react'
import { NavItem } from './NavItem'
import { NavItemProps } from './NavItem.types'

const meta: Meta<typeof NavItem> = {
  title: 'atoms/NavItem',
  component: NavItem,
  decorators: [
    Story => (
      <div className="h-64">
        <Story />
      </div>
    )
  ],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12964-1203'
    },
    docs: { description: { component: 'The Lamb NavItem component' } }
  },
  args: {
    label: 'Ensino',
    iconName: 'auto_stories',
    activated: false,
    collapsed: false,
    subItems: []
  },
  argTypes: {
    subItems: {
      description: 'Whether the nav item has sub items',
      table: {
        type: { summary: 'NavigationChildProps[]' },
        defaultValue: { summary: '[]' }
      },
      control: false
    },
    iconName: {
      description: 'The name of the icon to display',
      table: {
        type: { summary: 'string' }
      },
      control: 'text'
    },
    activated: {
      description: 'Whether the nav item starts activated',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      },
      control: 'boolean'
    }
  }
}

export default meta

export const Default: StoryFn<NavItemProps> = args => {
  const [url, setUrl] = useState('')
  const params: NavItemProps = {
    ...args,
    subItems: [
      {
        label: 'Séries',
        activated: url.includes('series'),
        onClick: () => setUrl('series')
      },
      {
        label: 'Palavras',
        activated: url.includes('words'),
        onClick: () => setUrl('words')
      },
      {
        label: 'PDVM',
        activated: url.includes('pdvm'),
        onClick: () => setUrl('pdvm')
      },
      {
        label: 'Planos de leitura',
        activated: url.includes('reading-plans'),
        onClick: () => setUrl('reading-plans')
      }
    ]
  }

  return <NavItem {...params} />
}
