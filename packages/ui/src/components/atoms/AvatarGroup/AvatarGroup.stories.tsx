import type { Meta, StoryObj } from '@storybook/nextjs'
import { AvatarGroup, AvatarGroupProps } from './AvatarGroup'

const sizes: NonNullable<AvatarGroupProps['size']>[] = [
  'xSmall',
  'small',
  'medium',
  'large',
  'xLarge'
]

export default {
  title: 'atoms/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `AvatarGroup`: overlapping avatars with a "+N" circle. The Figma node is pending (task Unresolved 1).'
      }
    }
  },
  args: {
    max: 3,
    people: [
      { name: 'Ana Exemplo' },
      { name: 'Bruno Teste' },
      { name: 'Carla Fictícia' },
      { name: 'Davi Exemplo' },
      { name: 'Eva Teste' }
    ],
    size: 'small'
  },
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      table: { defaultValue: { summary: 'small' } }
    },
    max: { control: 'number', table: { defaultValue: { summary: '3' } } },
    label: {
      control: 'text',
      description: 'Accessible name; defaults to every name, comma separated'
    }
  }
} as Meta<AvatarGroupProps>

export const Default: StoryObj<AvatarGroupProps> = {}

export const WithoutOverflow: StoryObj<AvatarGroupProps> = {
  args: { max: 5 }
}

export const CustomLabel: StoryObj<AvatarGroupProps> = {
  args: { label: '5 participantes' }
}

export const Sizes: StoryObj<AvatarGroupProps> = {
  render: args => (
    <div className="flex flex-col items-start gap-4">
      {sizes.map(size => (
        <AvatarGroup {...args} key={size} size={size} />
      ))}
    </div>
  )
}
