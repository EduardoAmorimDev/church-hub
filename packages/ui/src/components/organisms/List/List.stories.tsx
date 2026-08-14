import type { Meta, StoryObj } from '@storybook/nextjs'
import { Icon } from '@church/ui/atoms/Icon'
import { ListItem } from '@church/ui/molecules/ListItem'
import { List, ListSection } from './List'
import { ListProps } from './List.types'

// invariant: synthetic data only (constitution, Principle V).
const person = (letter: string) => (
  <ListItem
    key={letter}
    leading={<Icon name="person" />}
    onClick={() => undefined}
    subtitle={`GC Exemplo ${letter}`}
    title={`Pessoa Exemplo ${letter}`}
  />
)

export default {
  title: 'organisms/List',
  component: List,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `List`: a `role="list"` container for ListItems, with optional sections (`ListSection`, from the same import), a loading skeleton and an embedded EmptyState. `density` applies to every ListItem that sets none. It has no Figma node: the Lamb artifact created it.'
      }
    },
    layout: 'padded'
  },
  args: {
    children: ['A', 'B', 'C'].map(person),
    density: 'default',
    label: 'Aniversariantes',
    loading: false,
    skeletonCount: 3
  },
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'default', 'comfortable'],
      table: { defaultValue: { summary: 'default' } }
    },
    skeletonCount: { table: { defaultValue: { summary: '3' } } },
    children: { control: false },
    empty: { control: false }
  }
} as Meta<ListProps>

export const Default: StoryObj<ListProps> = {}

export const Sections: StoryObj<ListProps> = {
  args: {
    children: [
      <ListSection key="hoje" title="Hoje">
        {['A', 'B'].map(person)}
      </ListSection>,
      <ListSection key="semana" title="Esta semana">
        {['C', 'D', 'E'].map(person)}
      </ListSection>
    ]
  }
}

export const Loading: StoryObj<ListProps> = {
  args: { loading: true }
}

export const Empty: StoryObj<ListProps> = {
  args: {
    children: [],
    empty: {
      description: 'Volte na segunda.',
      iconName: 'cake',
      title: 'Nenhum aniversariante esta semana'
    }
  }
}
