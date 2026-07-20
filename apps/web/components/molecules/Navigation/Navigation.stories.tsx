import type { Meta, StoryFn } from '@storybook/nextjs'
import { Navigation, NavigationProps } from './Navigation'
import { useState } from 'react'
import { MaterialSymbol } from 'material-symbols'

const meta: Meta<NavigationProps> = {
  title: 'molecules/Navigation',
  component: Navigation,
  decorators: [
    Story => (
      <div className="h-140">
        <Story />
      </div>
    )
  ],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12964-1203'
    },
    docs: { description: { component: 'The Lamb Navigation component' } }
  },
  args: {
    collapsed: false,
    items: []
  },
  argTypes: {
    collapsed: {
      description: 'Whether the navigation is collapsed',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      },
      control: 'boolean'
    },
    items: {
      description: 'Items displayed in the navigation component',
      table: {
        type: {
          summary: 'NavItemProps[] }'
        },
        defaultValue: { summary: '[]' }
      }
    }
  }
}

export default meta

export const Default: StoryFn<NavigationProps> = args => {
  const [url, setUrl] = useState('')
  const params: NavigationProps = {
    ...args,
    items: [
      {
        id: '1',
        label: 'Início',
        iconName: 'home',
        activated: url === '',
        onClick: () => setUrl('')
      },
      {
        id: '2',
        label: 'Pessoas',
        iconName: 'people_alt' as MaterialSymbol,
        activated: url === 'people',
        subItems: [
          {
            label: 'Membros',
            activated: url === 'members',
            onClick: () => setUrl('members')
          },
          {
            label: 'Visitantes',
            activated: url === 'visitors',
            onClick: () => setUrl('visitors')
          },
          {
            label: 'GCs',
            activated: url === 'gcs',
            onClick: () => setUrl('gcs')
          },
          {
            label: 'Ministérios',
            activated: url === 'ministries',
            onClick: () => setUrl('ministries')
          }
        ]
      },
      {
        id: '3',
        label: 'Ensino',
        iconName: 'auto_stories',
        activated: false,
        collapsed: false,
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
    ]
  }

  return <Navigation {...params} />
}
