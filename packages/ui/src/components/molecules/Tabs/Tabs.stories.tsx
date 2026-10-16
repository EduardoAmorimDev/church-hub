import type { Meta, StoryObj } from '@storybook/nextjs'
import { Tabs } from './Tabs'
import { TabsProps } from './Tabs.types'

export default {
  title: 'molecules/Tabs',
  component: Tabs,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/HQ5Vfbwug9vzIskrlSIXJW/Backoffice?node-id=141-4446&m=dev'
    },
    docs: {
      description: {
        component:
          'Page-level navigation drawn as small chips: each tab is a link and the current page carries `aria-current="page"`. Not the ARIA tab pattern, which switches panels on the same page.'
      }
    }
  },
  args: {
    label: 'Seções de pessoas',
    items: [
      { label: 'Membros', href: '/people', current: true },
      { label: 'Visitantes', href: '/people?tab=visitors' },
      { label: 'Grupos de Crescimento', href: '/people?tab=groups' },
      { label: 'Ministérios', href: '/people?tab=ministries' }
    ]
  }
} as Meta<TabsProps>

export const Default: StoryObj<TabsProps> = {}
