import type { Meta, StoryObj } from '@storybook/nextjs'
import { Breadcrumb, BreadcrumbProps } from './Breadcrumb'

export default {
  title: 'molecules/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13601-3774&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Breadcrumb`: the trail from the root to the current page. Use it from the second level down.'
      }
    }
  },
  args: {
    items: [
      { label: 'Início', href: '#' },
      { label: 'Pessoas', href: '#' },
      { label: 'Pessoa Fictícia' }
    ]
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name of the nav',
      table: { defaultValue: { summary: 'Trilha de navegação' } }
    }
  }
} as Meta<BreadcrumbProps>

export const Default: StoryObj<BreadcrumbProps> = {}

export const WithoutLink: StoryObj<BreadcrumbProps> = {
  args: {
    items: [
      { label: 'Início', href: '#' },
      { label: 'Relatórios' },
      { label: 'Relatório de exemplo' }
    ]
  }
}

export const Deep: StoryObj<BreadcrumbProps> = {
  args: {
    items: [
      { label: 'Início', href: '#' },
      { label: 'Grupos', href: '#' },
      { label: 'Grupo Exemplo', href: '#' },
      { label: 'Encontro de teste' }
    ]
  }
}
