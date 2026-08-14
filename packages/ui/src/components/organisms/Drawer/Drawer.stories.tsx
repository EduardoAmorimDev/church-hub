import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { IconButton } from '@church/ui/atoms/IconButton'
import { TextField } from '@church/ui/atoms/TextField'
import { Drawer } from './Drawer'
import { DrawerProps } from './Drawer.types'

// invariant: synthetic data only (constitution, Principle V).
const footer = (close: () => void) => (
  <>
    <Button color="neutral" onClick={close} variant="filled">
      Salvar
    </Button>
    <Button color="neutral" onClick={close} variant="ghost">
      Cancelar
    </Button>
  </>
)

const Render = (args: DrawerProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  if (args.mode === 'inline')
    return (
      <div className="flex h-160 gap-6">
        <p className="flex-1">Lista de pessoas</p>
        <Drawer {...args} footer={footer(close)} open />
      </div>
    )
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir detalhes</Button>
      <Drawer {...args} footer={footer(close)} onClose={close} open={open} />
    </>
  )
}

export default {
  title: 'organisms/Drawer',
  component: Drawer,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13803-11075&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Drawer`: a 650px side panel to view and edit a record without leaving the list. `mode="modal"` (default) is a dialog with scrim, focus trap and Esc; `mode="inline"` sits in the layout for split views. Below 698px the modal panel keeps 24px on both sides (assumed; see the task, Unresolved 2).'
      }
    },
    layout: 'padded'
  },
  render: Render,
  args: {
    children: (
      <>
        <TextField label="Nome" />
        <TextField label="Telefone" />
      </>
    ),
    description: 'Membro desde 2020',
    divider: true,
    headerActions: (
      <IconButton aria-label="Editar" size="small" variant="transparent">
        <Icon name="edit" />
      </IconButton>
    ),
    mode: 'modal',
    title: 'Pessoa Exemplo'
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['modal', 'inline'],
      table: { defaultValue: { summary: 'modal' } }
    },
    divider: { table: { defaultValue: { summary: 'true' } } },
    open: { control: false },
    children: { control: false },
    footer: { control: false },
    headerActions: { control: false }
  }
} as Meta<DrawerProps>

export const Modal: StoryObj<DrawerProps> = {}

export const Inline: StoryObj<DrawerProps> = {
  args: { mode: 'inline' }
}

export const WithBack: StoryObj<DrawerProps> = {
  args: { headerActions: undefined, onBack: () => undefined }
}
