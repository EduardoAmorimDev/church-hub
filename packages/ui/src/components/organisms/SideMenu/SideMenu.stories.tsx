import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { SideMenu } from './SideMenu'
import { SideMenuProps } from './SideMenu.types'

// invariant: synthetic data only (constitution, Principle V).
const Render = (args: SideMenuProps) => {
  const [current, setCurrent] = useState('inicio')
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
    {
      iconName: 'auto_stories',
      label: 'Ensino',
      subItems: [
        { label: 'Séries', ...item('series') },
        { label: 'Planos de leitura', ...item('planos') }
      ]
    },
    { iconName: 'campaign', label: 'Comunicação', count: 3, ...item('avisos') },
    { iconName: 'bar_chart', label: 'Gestão', ...item('gestao') }
  ]
  const footerItems: NavItemProps[] = [
    { iconName: 'settings', label: 'Configurações', ...item('config') }
  ]

  return (
    <div className="flex h-160">
      <SideMenu {...args} footerItems={footerItems} items={items} />
      <p className="text-secondary flex-1 p-8">Conteúdo da página</p>
    </div>
  )
}

export default {
  title: 'organisms/SideMenu',
  component: SideMenu,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12967-3606&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `SideMenu`: the backoffice side navigation (Painel, from 960px), 240px expanded and 64px collapsed, with the logo, a collapse button, the `Navigation`, footer items and the profile button. The consumer marks the current page with `activated` and navigates through `href` or `onClick`; routes, permissions and the collapsed state persistence stay in the app.'
      }
    },
    layout: 'fullscreen'
  },
  render: Render,
  args: {
    items: [],
    label: 'Menu principal',
    user: { name: 'Pessoa Exemplo', role: 'Função Exemplo' }
  }
} satisfies Meta<SideMenuProps>

type Story = StoryObj<SideMenuProps>

export const Default: Story = {}

export const Collapsed: Story = {
  args: { defaultCollapsed: true }
}

export const WithoutUser: Story = {
  args: { user: undefined }
}

export const WithProfileMenu: Story = {
  args: { profileMenuItems: [{ iconName: 'logout', label: 'Sair' }] }
}
