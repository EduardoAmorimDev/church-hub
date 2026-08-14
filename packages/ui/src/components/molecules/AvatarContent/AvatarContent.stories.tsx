import type { Meta, StoryObj } from '@storybook/nextjs'
import { AvatarContent, AvatarContentProps } from './AvatarContent'
import { Badge } from '@church/ui/atoms/Badge'

export default {
  title: 'molecules/AvatarContent',
  component: AvatarContent,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13803-10719&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `AvatarContent`: the identity header of a person page. The layout follows the Lamb artifact (avatar beside the name), as the user decided on 2026-10-08.'
      }
    }
  },
  args: {
    description: 'Rede Exemplo · GC de Teste',
    headingLevel: 3,
    meta: [
      { label: 'Rede', value: 'Rede Exemplo' },
      { label: 'GC', value: 'GC de Teste' },
      { label: 'Membro desde', value: '2000' },
      { label: 'Função', value: 'Exemplo' }
    ],
    name: 'Pessoa Fictícia',
    src: ''
  },
  argTypes: {
    headingLevel: { control: 'select', options: [2, 3, 4] },
    badges: { control: false },
    meta: { control: 'object' }
  }
} as Meta<AvatarContentProps>

export const Default: StoryObj<AvatarContentProps> = {}

export const WithBadges: StoryObj<AvatarContentProps> = {
  args: {
    badges: (
      <>
        <Badge>Membro</Badge>
        <Badge>Líder</Badge>
      </>
    )
  }
}

export const NameOnly: StoryObj<AvatarContentProps> = {
  args: { description: undefined, meta: [] }
}
