import type { Meta, StoryObj } from '@storybook/nextjs'
import { Logo, LogoProps } from './Logo'

export default {
  title: 'atoms/Logo',
  component: Logo,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12924-1122&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Logo`. The ink follows `neutral-999` (white in dark); the arcs keep the brand colours. Change the height with a `h-*` class (minimum 24px).'
      }
    }
  },
  args: {
    variant: 'full'
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      description: '`full` = symbol + wordmark; `symbol` = the arcs alone',
      options: ['full', 'symbol'],
      table: { defaultValue: { summary: 'full' } }
    },
    label: {
      control: 'text',
      description: 'Accessible name',
      table: { defaultValue: { summary: 'Igreja Batista Filadélfia' } }
    }
  }
} as Meta<LogoProps>

export const Full: StoryObj<LogoProps> = {}

export const SymbolOnly: StoryObj<LogoProps> = {
  args: { variant: 'symbol' }
}

export const Small: StoryObj<LogoProps> = {
  args: { className: 'h-6' }
}
