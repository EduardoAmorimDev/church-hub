import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '../Button'
import { TextField } from '../TextField'
import { Stack, StackProps } from './Stack'

export default {
  title: 'atoms/Stack',
  component: Stack,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `Stack`: the gap between components follows tier × relation × density (guideline "Espaçamento e composição"). It has no Figma node. `auto` density is Painel from 960px and App below, or what an ancestor `data-viewport` forces.'
      }
    }
  },
  args: {
    density: 'auto',
    direction: 'vertical',
    interactive: false,
    relation: 'weak',
    surfaces: true,
    tier: 'composite',
    wrap: true
  },
  argTypes: {
    tier: {
      control: 'inline-radio',
      options: ['primitive', 'composite', 'block'],
      table: { defaultValue: { summary: 'composite' } }
    },
    relation: {
      control: 'inline-radio',
      options: ['strong', 'weak', 'none'],
      table: { defaultValue: { summary: 'weak' } }
    },
    density: {
      control: 'inline-radio',
      options: ['auto', 'panel', 'app'],
      table: { defaultValue: { summary: 'auto' } }
    },
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: 'vertical' } }
    },
    align: {
      control: 'select',
      options: [undefined, 'start', 'center', 'end', 'stretch', 'baseline']
    },
    justify: {
      control: 'select',
      options: [
        undefined,
        'start',
        'center',
        'end',
        'between',
        'around',
        'evenly'
      ]
    }
  }
} as Meta<StackProps>

export const FieldGroups: StoryObj<StackProps> = {
  args: { relation: 'none' },
  render: args => (
    <Stack {...args}>
      <Stack aria-labelledby="dados" as="section" relation="weak">
        <h3 className="text-size-75 text-primary font-semibold" id="dados">
          Dados do GC
        </h3>
        <TextField label="Nome" placeholder="GC Exemplo" />
        <TextField label="Rede" placeholder="Rede Exemplo" />
      </Stack>
      <Stack aria-labelledby="lideranca" as="section" relation="weak">
        <h3 className="text-size-75 text-primary font-semibold" id="lideranca">
          Liderança
        </h3>
        <TextField label="Líder" placeholder="Pessoa Exemplo" />
      </Stack>
    </Stack>
  )
}

export const Actions: StoryObj<StackProps> = {
  args: {
    direction: 'horizontal',
    interactive: true,
    relation: 'strong',
    tier: 'primitive'
  },
  render: args => (
    <Stack {...args}>
      <Button>Enviar</Button>
      <Button variant="ghost">Rascunho</Button>
    </Stack>
  )
}

export const ForcedApp: StoryObj<StackProps> = {
  render: args => (
    <div data-viewport="mobile">
      <Stack {...args}>
        <TextField label="Nome" />
        <TextField label="Rede" />
      </Stack>
    </div>
  )
}
