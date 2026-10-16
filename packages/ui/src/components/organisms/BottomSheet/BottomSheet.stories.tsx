import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Checkbox } from '@church/ui/atoms/Checkbox'
import { BottomSheet } from './BottomSheet'
import { BottomSheetProps } from './BottomSheet.types'

// invariant: synthetic data only (constitution, Principle V).
const PARTICIPANTS = [
  'Pessoa Exemplo 1',
  'Pessoa Exemplo 2',
  'Pessoa Exemplo 3'
]

const Render = (args: BottomSheetProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir painel</Button>
      <BottomSheet
        {...args}
        footer={
          <Button color="neutral" onClick={close} size="large">
            Salvar presença
          </Button>
        }
        onClose={close}
        open={open}
      />
    </>
  )
}

export default {
  title: 'organisms/BottomSheet',
  component: BottomSheet,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `BottomSheet`: a panel anchored to the bottom for quick actions, filters and choices in the App. Drag the handle or header down past 25% of its height (at least 96px), or flick it, to close; Fechar is always there as the alternative. It rises with the virtual keyboard and does not animate under reduced motion. It has no Figma node: the Lamb artifact created it.'
      }
    },
    layout: 'fullscreen'
  },
  render: Render,
  args: {
    children: PARTICIPANTS.map(name => <Checkbox key={name} label={name} />),
    detents: 'auto',
    dismissible: true,
    safeArea: 'mock',
    title: 'Marcar presença'
  },
  argTypes: {
    detents: {
      control: 'select',
      options: ['auto', 'half', 'full'],
      table: { defaultValue: { summary: 'auto' } }
    },
    safeArea: {
      control: 'select',
      options: ['env', 'mock', 'none'],
      table: { defaultValue: { summary: 'env' } }
    },
    dismissible: { table: { defaultValue: { summary: 'true' } } },
    open: { control: false },
    children: { control: false },
    footer: { control: false }
  }
} as Meta<BottomSheetProps>

export const Default: StoryObj<BottomSheetProps> = {}

export const Half: StoryObj<BottomSheetProps> = {
  args: { detents: 'half' }
}

export const Full: StoryObj<BottomSheetProps> = {
  args: { detents: 'full' }
}
