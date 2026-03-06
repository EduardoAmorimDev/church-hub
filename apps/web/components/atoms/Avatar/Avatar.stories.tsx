import { Meta, StoryObj } from '@storybook/nextjs'
import { Avatar, AvatarProps } from './Avatar'

const sizes = ['small', 'medium', 'large', 'xlarge']

export default {
  title: 'Atoms/Avatar',
  component: Avatar,
  args: {
    alt: 'Lucas Fernandes Vieira',
    size: 'medium',
    src: 'https://imgs.search.brave.com/9fFZhGzGRaZuCAATXmPf8SBLFBtqScRqzGZ7Sik80Ec/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2ph/bWVzY2FtZXJvbnNh/dmF0YXIvaW1hZ2Vz/LzYvNjMvQW5zb25f/YXZhdGFyLnBuZy9y/ZXZpc2lvbi9sYXRl/c3Q_Y2I9MjAyMjEw/MTQxMzQxMzk'
  },
  argTypes: {
    size: {
      description: 'The size of the avatar',
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' }
      },
      control: 'select',
      options: sizes
    },
    src: {
      description: 'The source URL of the avatar image',
      table: { type: { summary: 'string' } },
      control: 'text'
    },
    alt: {
      description: 'The alt text for the avatar image',
      table: { type: { summary: 'string' } },
      control: 'text'
    }
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=47-342&p=f&t=w0AKf7PLXcGNgESX-0'
    },
    docs: { description: { component: 'The Lamb DS `Avatar` component' } }
  },
  tags: ['autodocs']
} as Meta<AvatarProps>

export const Default: StoryObj<AvatarProps> = {}
