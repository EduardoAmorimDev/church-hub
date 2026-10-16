import type { Meta, StoryObj } from '@storybook/nextjs'
import { Tag, TagProps } from './Tag'
import { Icon } from '../Icon'
import { accentColors, sizes } from '../data'

export default {
  title: 'atoms/Tag',
  component: Tag,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13596-406&m=dev'
    },
    docs: { description: { component: 'The Lamb DS `Tag` component' } }
  },
  args: {
    children: 'Label',
    color: 'blue',
    size: 'small',
    endIcon: <Icon name="brightness_1" />,
    startIcon: <Icon name="brightness_1" />
  },
  argTypes: {
    color: {
      control: 'select',
      description: 'The color of the tag',
      options: ['neutral', ...accentColors],
      table: {
        type: { summary: ['neutral', ...accentColors].join('|') },
        defaultValue: { summary: 'blue' }
      }
    },
    size: {
      control: 'select',
      description: 'The size of the tag',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'small' }
      }
    },
    endIcon: {
      description:
        'An optional icon to be rendered at the end of the tag. The size of the icon will be automatically adjusted based on the tag size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    },
    startIcon: {
      description:
        'An optional icon to be rendered at the start of the tag. The size of the icon will be automatically adjusted based on the tag size',
      control: false,
      table: {
        type: { summary: 'ReactElement<IconProps>' },
        defaultValue: 'undefined'
      }
    }
  }
} as Meta<TagProps>

export const Default: StoryObj<TagProps> = {}

export const WithIcon: StoryObj<TagProps> = {
  args: {
    endIcon: <Icon name="brightness_1" />,
    startIcon: <Icon name="brightness_1" />
  }
}
