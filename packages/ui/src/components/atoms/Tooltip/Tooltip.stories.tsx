import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { Tooltip, TooltipProps } from './Tooltip'

const placements = ['top', 'bottom', 'left', 'right'] as const

export default {
  title: 'atoms/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'A short, informational label shown on hover/focus of its trigger. Not verified against Figma yet — the design file (Lamb-Design-System) is currently inaccessible to the connected Figma account (no edit access), so this was built from the design tokens already used across the other atoms.'
      }
    }
  },
  args: {
    children: (
      <IconButton aria-label="Mais informações">
        <Icon name="info" />
      </IconButton>
    ),
    content: 'Usado apenas para validar sua identidade',
    disabled: false,
    placement: 'top'
  },
  argTypes: {
    children: {
      control: false,
      description: 'The trigger element the tooltip is anchored to',
      table: {
        type: { summary: 'ReactElement' }
      }
    },
    content: {
      control: 'text',
      description:
        "The tooltip's text content. When omitted, the trigger renders as-is",
      table: {
        type: { summary: 'ReactNode' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the tooltip, preventing it from ever being shown',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    placement: {
      control: 'select',
      description: 'Which side of the trigger the tooltip is anchored to',
      options: placements,
      table: {
        type: { summary: placements.join(' | ') },
        defaultValue: { summary: 'top' }
      }
    }
  }
} as Meta<TooltipProps>

export const Default: StoryObj<TooltipProps> = {}

export const Bottom: StoryObj<TooltipProps> = {
  args: { placement: 'bottom' }
}

export const Left: StoryObj<TooltipProps> = {
  args: { placement: 'left' }
}

export const Right: StoryObj<TooltipProps> = {
  args: { placement: 'right' }
}

export const OnText: StoryObj<TooltipProps> = {
  args: {
    children: <span className="cursor-default text-neutral-100">CPF</span>,
    content: 'Usado apenas para validar sua identidade'
  }
}

export const Disabled: StoryObj<TooltipProps> = {
  args: { disabled: true }
}
