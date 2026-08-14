import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Chip } from '@church/ui/atoms/Chip'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { StatCard } from '@church/ui/molecules/StatCard'
import { PageHeader } from '@church/ui/organisms/PageHeader'
import { Page, PageBody } from './Page'
import { PageProps } from './Page.types'

// invariant: synthetic data only (constitution, Principle V).
const Render = (args: PageProps) => {
  const [current, setCurrent] = useState('membros')
  const item = (id: string) => ({
    activated: current === id,
    onClick: () => setCurrent(id)
  })
  const items: NavItemProps[] = [
    { iconName: 'home', label: 'Início', ...item('inicio') },
    {
      iconName: 'group',
      label: 'Pessoas',
      subItems: [
        { label: 'Membros', ...item('membros') },
        { label: 'Visitantes', ...item('visitantes') },
        { label: 'GCs', ...item('gcs') }
      ]
    },
    { iconName: 'campaign', label: 'Comunicação', count: 3, ...item('avisos') },
    { iconName: 'bar_chart', label: 'Gestão', ...item('gestao') }
  ]
  const footerItems: NavItemProps[] = [
    { iconName: 'settings', label: 'Configurações', ...item('config') }
  ]

  return (
    <div className="h-screen">
      <Page
        {...args}
        header={
          <PageHeader
            actions={<Button size="small">Adicionar membro</Button>}
            breadcrumb={[
              { label: 'Início', href: '#' },
              { label: 'Pessoas', href: '#' },
              { label: 'Membros' }
            ]}
            chips={
              <>
                <Chip selected>Todos</Chip>
                <Chip>Ativos</Chip>
                <Chip>Novos</Chip>
              </>
            }
            description="Quem faz parte da igreja"
            title="Membros"
          />
        }
        nav={{
          footerItems,
          items,
          user: { name: 'Pessoa Exemplo', role: 'Função Exemplo' }
        }}
      >
        <PageBody
          stats={
            <>
              <StatCard iconName="group" label="Membros ativos" value={128} />
              <StatCard iconName="person_add" label="Novos" value={12} />
              <StatCard iconName="waving_hand" label="Visitantes" value={34} />
            </>
          }
        >
          <p className="text-secondary">Conteúdo da página</p>
        </PageBody>
      </Page>
    </div>
  )
}

export default {
  title: 'templates/Page',
  component: Page,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13505-266&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Page` template for data-viewing screens of the backoffice: the `SideMenu` (`nav`), the `PageHeader` (`header`) and the `PageBody` (`stats` grid + content) inside a `<main>` up to 1440px, with a "Pular para o conteúdo" skip link. Below 960px the SideMenu gives way to a top bar and the `MenuDrawer`, in CSS only; `responsive={false}` keeps the SideMenu. `PageBody` comes from the same import.'
      }
    },
    layout: 'fullscreen'
  },
  render: Render,
  args: {
    responsive: true,
    skipLinkLabel: 'Pular para o conteúdo'
  }
} satisfies Meta<PageProps>

type Story = StoryObj<PageProps>

export const Default: Story = {}

export const NotResponsive: Story = {
  args: { responsive: false }
}
