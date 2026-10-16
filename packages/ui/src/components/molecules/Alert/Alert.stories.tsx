import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Alert, AlertProps } from './Alert'

const variants = ['info', 'success', 'warning', 'error']

export default {
  title: 'molecules/Alert',
  component: Alert,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13792-9332&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Alert`: an in-page notice. `live` announces it (`alert` for error, `status` otherwise).'
      }
    }
  },
  args: {
    children: 'O relatório do encontro de exemplo foi enviado ao líder.',
    live: false,
    title: 'Relatório enviado',
    variant: 'success'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
      table: { defaultValue: { summary: 'success' } }
    },
    iconName: { control: 'text' },
    closeLabel: {
      control: 'text',
      table: { defaultValue: { summary: 'Fechar aviso' } }
    },
    live: { control: 'boolean' }
  }
} as Meta<AlertProps>

export const Default: StoryObj<AlertProps> = {}

export const Variants: StoryObj<AlertProps> = {
  render: args => (
    <div className="flex flex-col gap-4">
      <Alert {...args} variant="success" />
      <Alert {...args} title="Novidade no sistema" variant="info" />
      <Alert {...args} title="Relatório pendente" variant="warning" />
      <Alert {...args} title="Não foi possível enviar" variant="error" />
    </div>
  )
}

export const WithActionsAndClose: StoryObj<AlertProps> = {
  args: {
    actions: (
      <Button color="neutral" size="small" variant="ghost">
        Ver relatório
      </Button>
    ),
    onClose: () => undefined
  }
}
