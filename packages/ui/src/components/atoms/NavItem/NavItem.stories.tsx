import type { Meta, StoryFn } from '@storybook/nextjs'
import { useState } from 'react'
import { NavItem } from './NavItem'
import { NavItemProps } from './NavItem.types'

const meta: Meta<NavItemProps> = {
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
    design: [
      {
        name: 'Nav item',
        type: 'figma',
        url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12966-3837&m=dev'
      },
      {
        name: 'Nav sub-item',
        type: 'figma',
        url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13506-10602&m=dev'
      }
    ],
    docs: { description: { component: 'The Lamb NavItem component' } }
  },
  args: {
    label: 'Ensino',
    iconName: 'auto_stories',
    activated: false,
    collapsed: false,
    selected: false,
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
    selected: {
      description:
        'Whether the item is on the trail of the current page (filled icon, primary text, no background)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      },
      control: 'boolean'
    },
    activated: {
      description: 'Whether the item is the current page',
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

export const Activated: StoryFn<NavItemProps> = args => (
  <NavItem {...args} activated iconName="home" label="Início" subItems={[]} />
)

export const Selected: StoryFn<NavItemProps> = args => (
  <NavItem {...args} iconName="group" label="Pessoas" selected subItems={[]} />
)

export const Collapsed: StoryFn<NavItemProps> = args => (
  <NavItem {...args} collapsed iconName="home" label="Início" subItems={[]} />
)
