import type { Meta, StoryObj } from '@storybook/nextjs'

import { tagsByVariant, Typography, TypographyProps } from './Typography'

const variants = Object.keys(tagsByVariant) as TypographyProps['variant'][]

export default {
  title: 'atoms/Typography',
  component: Typography,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=12893-2437&p=f&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Typography` component' } }
  },
  args: {
    children: 'Lorem ipsum',
    variant: 'p1'
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the typography component',
      table: {
        type: { summary: 'ReactNode | string' }
      }
    },
    variant: {
      control: 'select',
      description:
        'The variant of the typography, defining size, weight, font and semantic tag (d1-d3 and f1-4 render as span, p1-p3 render as p, h1-h5 render as their matching heading tag)',
      options: variants,
      table: {
        type: { summary: variants.join(' | ') },
        defaultValue: { summary: 'p1' }
      }
    },
    as: {
      control: 'text',
      description:
        'Optional override for the rendered HTML tag, keeping the variant styles but changing semantics (e.g. variant="p1" as="h2")',
      table: {
        type: { summary: 'ElementType' },
        defaultValue: { summary: 'undefined' }
      }
    },
    className: {
      control: 'text',
      description: 'Additional class names to extend or override styles',
      table: {
        type: { summary: 'string' }
      }
    }
  }
} as Meta<TypographyProps>

export const Default: StoryObj<TypographyProps> = {}

export const AllVariants: StoryObj<TypographyProps> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {variants.map(variant => (
        <div
          key={variant}
          style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}
        >
          <span
            style={{ width: 96, fontFamily: 'monospace', color: '#7A5AF8' }}
          >
            {variant}
          </span>
          <Typography variant={variant}>Lorem ipsum</Typography>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true }
  }
}
