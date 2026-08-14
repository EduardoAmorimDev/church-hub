import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Chip } from '@church/ui/atoms/Chip'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { PageHeader } from './PageHeader'
import { PageHeaderProps } from './PageHeader.types'

// invariant: synthetic data only (constitution, Principle V).
export default {
  title: 'organisms/PageHeader',
  component: PageHeader,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13505-4430&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `PageHeader`: `home` greets on the start screen (Display text); `primary` (default) shows the breadcrumb, a single `<h1>`, the description, the actions (one neutral High action, icon-only secondaries) and the quick-filter chips.'
      }
    }
  },
  decorators: [
    Story => (
      <div className="bg-page">
        <Story />
      </div>
    )
  ],
  args: {
    actions: (
      <>
        <IconButton
          aria-label="Exportar"
          color="neutral"
          size="small"
          variant="ghost"
        >
          <Icon name="download" />
        </IconButton>
        <Button size="small">Adicionar membro</Button>
      </>
    ),
    breadcrumb: [
      { label: 'Início', href: '#' },
      { label: 'Pessoas', href: '#' },
      { label: 'Membros' }
    ],
    chips: (
      <>
        <Chip selected>Todos</Chip>
        <Chip>Ativos</Chip>
        <Chip>Novos</Chip>
      </>
    ),
    description: 'Quem faz parte da igreja',
    title: 'Membros',
    type: 'primary'
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['primary', 'home'] }
  }
} satisfies Meta<PageHeaderProps>

type Story = StoryObj<PageHeaderProps>

export const Primary: Story = {}

export const Home: Story = {
  args: {
    description: 'Resumo da semana',
    greeting: 'Olá, Pessoa Exemplo',
    type: 'home'
  }
}
