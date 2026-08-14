import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { EmptyState, EmptyStateProps } from './EmptyState'

export default {
  title: 'molecules/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `EmptyState`: what a list or page shows with nothing in it, after a success, or on a load error. It has no Figma node: the Lamb artifact created it.'
      }
    }
  },
  args: {
    actions: (
      <Button color="neutral" size="small">
        Criar relatório
      </Button>
    ),
    description: 'Os relatórios enviados pelos líderes aparecem aqui.',
    headingLevel: 3,
    size: 'medium',
    status: 'neutral',
    title: 'Nenhum relatório ainda',
    variant: 'inline'
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['neutral', 'success', 'error'],
      table: { defaultValue: { summary: 'neutral' } }
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      table: { defaultValue: { summary: 'medium' } }
    },
    variant: {
      control: 'select',
      options: ['page', 'inline', 'compact'],
      table: { defaultValue: { summary: 'inline' } }
    },
    headingLevel: { control: 'select', options: [2, 3, 4, 5, 6] },
    iconName: { control: 'text' },
    actions: { control: false },
    illustration: { control: false }
  }
} as Meta<EmptyStateProps>

export const Default: StoryObj<EmptyStateProps> = {}

export const Success: StoryObj<EmptyStateProps> = {
  args: {
    description: 'Todos os relatórios da semana foram enviados.',
    status: 'success',
    title: 'Tudo em dia'
  }
}

export const LoadError: StoryObj<EmptyStateProps> = {
  args: {
    actions: (
      <Button color="neutral" size="small" variant="ghost">
        Tentar de novo
      </Button>
    ),
    description: 'Verifique a conexão e tente de novo.',
    status: 'error',
    title: 'Não foi possível carregar'
  }
}

export const Page: StoryObj<EmptyStateProps> = { args: { variant: 'page' } }

export const Small: StoryObj<EmptyStateProps> = { args: { size: 'small' } }

export const Compact: StoryObj<EmptyStateProps> = {
  args: { iconName: 'diversity_3', variant: 'compact' }
}
