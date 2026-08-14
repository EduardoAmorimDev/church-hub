import type { Meta, StoryFn, StoryObj } from '@storybook/nextjs'
import { Cell } from './Cell'
import { Icon } from '../Icon'
import { Tag } from '../Tag'

const meta: Meta<typeof Cell> = {
  title: 'atoms/Cell',
  component: Cell,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13615-5291&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Cell` atom — one table cell. Header cells are 40px tall, data cells 48px.'
      }
    }
  },
  argTypes: {
    heading: {
      control: 'boolean',
      description:
        'Renders the header presentation. Only valid with `check` and `default`.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    type: {
      control: 'select',
      options: ['check', 'default', 'avatar', 'tag', 'action'],
      table: {
        type: { summary: "'check' | 'default' | 'avatar' | 'tag' | 'action'" }
      }
    }
  }
}
export default meta

export const Default: StoryObj<typeof Cell> = {
  args: { label: 'Ana Beatriz', paragraph: 'Diaconia', type: 'default' }
}

export const WithIcon: StoryObj<typeof Cell> = {
  args: {
    icon: <Icon name="event" />,
    label: 'Culto de domingo',
    paragraph: '10h',
    type: 'default'
  }
}

export const WithAvatar: StoryObj<typeof Cell> = {
  args: { label: 'Ana Beatriz', paragraph: 'Membro fictício', type: 'avatar' }
}

export const Header: StoryObj<typeof Cell> = {
  args: {
    heading: true,
    iconLeft: <Icon name="swap_vert" size="small" />,
    iconRight: <Icon name="more_vert" size="small" />,
    label: 'Nome',
    type: 'default'
  }
}

export const AllVariants: StoryFn<typeof Cell> = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col">
      <span className="text-secondary text-size-25">Heading</span>
      <div className="flex items-center">
        <Cell
          aria-label="Selecionar todos"
          checked={false}
          heading
          type="check"
        />
        <Cell
          heading
          iconLeft={<Icon name="swap_vert" size="small" />}
          iconRight={<Icon name="more_vert" size="small" />}
          label="Nome"
          type="default"
        />
      </div>
    </div>

    <div className="flex flex-col">
      <span className="text-secondary text-size-25">Data</span>
      <div className="flex items-center">
        <Cell aria-label="Selecionar linha" checked type="check" />
        <Cell label="Ana Beatriz" paragraph="Diaconia" type="default" />
        <Cell label="Sem segunda linha" type="default" />
        <Cell
          icon={<Icon name="event" />}
          label="Culto de domingo"
          type="default"
        />
        <Cell label="Carlos Menezes" paragraph="Diaconia" type="avatar" />
        <Cell
          action={
            <Cell
              actions={[
                {
                  'aria-label': 'Mais ações',
                  icon: <Icon name="more_vert" />,
                  onClick: () => {}
                }
              ]}
              type="action"
            />
          }
          tag={<Tag size="small">Ativo</Tag>}
          type="tag"
        />
        <Cell
          actions={[
            {
              'aria-label': 'Editar',
              icon: <Icon name="edit" />,
              onClick: () => {}
            },
            {
              'aria-label': 'Duplicar',
              icon: <Icon name="content_copy" />,
              onClick: () => {}
            },
            {
              'aria-label': 'Remover',
              icon: <Icon name="delete" />,
              onClick: () => {}
            }
          ]}
          type="action"
        />
      </div>
    </div>
  </div>
)
