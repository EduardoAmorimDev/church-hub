import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { TextField } from '@church/ui/atoms/TextField'
import { Dialog } from './Dialog'
import { DialogProps } from './Dialog.types'

// invariant: synthetic data only (constitution, Principle V).
const Render = (args: DialogProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
      <Dialog
        {...args}
        onClose={close}
        open={open}
        primaryAction={
          args.primaryAction && { ...args.primaryAction, onClick: close }
        }
        secondaryAction={
          args.secondaryAction && { ...args.secondaryAction, onClick: close }
        }
      />
    </>
  )
}

export default {
  title: 'organisms/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Dialog`: a centred modal to confirm an action, fill a short form or show a blocking notice. Focus is trapped, Esc and the scrim ask to close, focus returns to the trigger. Below 960px the actions stack full width, primary last; it never turns into a bottom sheet. It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  render: Render,
  args: {
    color: 'destructive',
    description:
      'Ela sai das listas de presença e dos relatórios. Você pode reativar depois em Pessoas.',
    dismissible: true,
    loading: false,
    open: false,
    primaryAction: { label: 'Inativar membro' },
    secondaryAction: { label: 'Cancelar' },
    size: 'small',
    title: 'Inativar Pessoa Exemplo?'
  },
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'destructive', 'positive', 'attention']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: { defaultValue: { summary: 'medium' } }
    },
    dismissible: { table: { defaultValue: { summary: 'true' } } },
    loading: { table: { defaultValue: { summary: 'false' } } },
    open: { control: false },
    footer: { control: false },
    children: { control: false }
  }
} as Meta<DialogProps>

export const Confirmation: StoryObj<DialogProps> = {}

export const Form: StoryObj<DialogProps> = {
  args: {
    children: (
      <>
        <TextField label="Nome" />
        <TextField label="Telefone" />
      </>
    ),
    color: undefined,
    description: undefined,
    primaryAction: { label: 'Adicionar' },
    size: 'medium',
    title: 'Adicionar visitante'
  }
}

export const Loading: StoryObj<DialogProps> = {
  args: { loading: true }
}

export const Informative: StoryObj<DialogProps> = {
  args: {
    color: 'positive',
    description: 'O relatório da semana foi enviado aos líderes.',
    primaryAction: { label: 'Entendi' },
    secondaryAction: undefined,
    title: 'Relatório enviado'
  }
}
