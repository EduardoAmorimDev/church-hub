import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { MenuDrawer } from './MenuDrawer'
import { MenuDrawerProps } from './MenuDrawer.types'

// invariant: synthetic data only (constitution, Principle V).
const Render = (args: MenuDrawerProps) => {
  const [open, setOpen] = useState(args.open)
  const [current, setCurrent] = useState('inicio')
  const item = (id: string) => ({
    activated: current === id,
    onClick: () => {
      setCurrent(id)
      setOpen(false)
    }
  })
  const items: NavItemProps[] = [
    { iconName: 'home', label: 'Início', ...item('inicio') },
    {
      iconName: 'group',
      label: 'Pessoas',
      subItems: [
        { label: 'Membros', ...item('membros') },
        { label: 'Visitantes', ...item('visitantes') }
      ]
    },
    { iconName: 'campaign', label: 'Comunicação', count: 3, ...item('avisos') }
  ]
  const footerItems: NavItemProps[] = [
    { iconName: 'settings', label: 'Configurações', ...item('config') }
  ]

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)} variant="ghost">
        Abrir menu
      </Button>
      <MenuDrawer
        {...args}
        footerItems={footerItems}
        items={items}
        onClose={() => setOpen(false)}
        open={open}
      />
    </div>
  )
}

export default {
  title: 'organisms/MenuDrawer',
  component: MenuDrawer,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13506-21084&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `MenuDrawer`: the hamburger navigation of the responsive web (below 960px), a modal dialog 390px wide with 48px items. Focus is trapped on open and returns to the menu button on close; Esc, the scrim and "Fechar menu" call `onClose`. It opens on the side of the menu button (`side="right"` by default). The `Page` template already wires it.'
      }
    },
    layout: 'fullscreen'
  },
  render: Render,
  args: {
    items: [],
    label: 'Menu principal',
    onClose: () => undefined,
    open: true,
    side: 'right',
    user: { name: 'Pessoa Exemplo', role: 'Função Exemplo' }
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left'] }
  }
} satisfies Meta<MenuDrawerProps>

type Story = StoryObj<MenuDrawerProps>

export const Default: Story = {}

export const Left: Story = {
  args: { side: 'left' }
}

export const Closed: Story = {
  args: { open: false }
}
