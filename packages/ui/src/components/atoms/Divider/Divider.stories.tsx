import type { Meta, StoryObj } from '@storybook/nextjs'
import { Divider, DividerProps } from './Divider'

export default {
  title: 'atoms/Divider',
  component: Divider,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=47-351&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Divider` component' } }
  },
  args: {
    decorative: true,
    orientation: 'horizontal'
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      description: 'Direction of the line',
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } }
    },
    decorative: {
      control: 'boolean',
      description:
        'Hidden from assistive technology; `false` exposes a separator for groups with meaning',
      table: { defaultValue: { summary: 'true' } }
    }
  }
} as Meta<DividerProps>

export const Horizontal: StoryObj<DividerProps> = {}

export const Vertical: StoryObj<DividerProps> = {
  args: { orientation: 'vertical' },
  render: args => (
    <div className="text-primary flex h-12 items-center gap-4">
      <span>Membros</span>
      <Divider {...args} />
      <span>Visitantes</span>
    </div>
  )
}
