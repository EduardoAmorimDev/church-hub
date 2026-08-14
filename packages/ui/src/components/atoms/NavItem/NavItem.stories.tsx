import type { Meta, StoryFn } from '@storybook/nextjs'
import { useState } from 'react'
import { NavItem } from './NavItem'
import { NavItemProps } from './NavItem.types'

// why: `NavItemProps` is a union (button, link, parent with sub-items); the
// controls share these props, and each story picks its own shape.
type NavItemStoryArgs = Pick<
  NavItemProps,
  'activated' | 'collapsed' | 'count' | 'iconName' | 'label' | 'selected'
>

const meta: Meta<NavItemStoryArgs> = {
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
    selected: false
  },
  argTypes: {
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

export const Default: StoryFn<NavItemStoryArgs> = args => {
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

export const Activated: StoryFn<NavItemStoryArgs> = args => (
  <NavItem {...args} activated iconName="home" label="Início" />
)

export const Selected: StoryFn<NavItemStoryArgs> = args => (
  <NavItem {...args} iconName="group" label="Pessoas" selected />
)

export const Collapsed: StoryFn<NavItemStoryArgs> = args => (
  <NavItem {...args} collapsed iconName="home" label="Início" />
)

export const WithCount: StoryFn<NavItemStoryArgs> = args => (
  <NavItem {...args} count={3} iconName="notifications" label="Avisos" />
)

export const WithHref: StoryFn<NavItemStoryArgs> = args => (
  <NavItem {...args} href="/membros" iconName="group" label="Membros" />
)
