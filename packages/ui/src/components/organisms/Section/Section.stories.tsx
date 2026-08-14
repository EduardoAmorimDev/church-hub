import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { SearchField } from '@church/ui/atoms/SearchField'
import { Paginator } from '@church/ui/molecules/Paginator'
import { Section } from './Section'
import { SectionProps } from './Section.types'

// invariant: synthetic data only (constitution, Principle V).
const PaginatorFooter = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  return (
    <Paginator
      className="flex-1"
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      page={page}
      pageSize={pageSize}
      totalItems={1234}
    />
  )
}

export default {
  title: 'organisms/Section',
  component: Section,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13596-6581&m=dev'
    },
    docs: {
      description: {
        component:
          'The Lamb DS `Section`: a backoffice content block with a header (title, description, actions, search and filters), a free body and an optional footer. `simple` drops the search/filters row. Where Figma and the artifact CSS differ (actions and filters gap, description, paginator footer padding), it follows the CSS (see the task, Unresolved 1). Do not use it as a page template or an empty state.'
      }
    },
    layout: 'padded'
  },
  args: {
    actions: (
      <>
        <Button
          color="neutral"
          size="small"
          startIcon={<Icon name="upload" />}
          variant="ghost"
        >
          Importar
        </Button>
        <Button color="neutral" size="small" startIcon={<Icon name="add" />}>
          Novo membro
        </Button>
      </>
    ),
    children: <p className="text-secondary m-0">Conteúdo da seção</p>,
    description: '1.234 pessoas cadastradas',
    filters: ['Situação', 'GC', 'Ministério'].map(label => (
      <Button
        color="neutral"
        endIcon={<Icon name="expand_more" />}
        key={label}
        size="small"
        variant="ghost"
      >
        {label}
      </Button>
    )),
    footer: <PaginatorFooter />,
    footerType: 'paginator',
    headingLevel: 2,
    search: <SearchField placeholder="Buscar membro" size="small" />,
    simple: false,
    title: 'Membros'
  },
  argTypes: {
    footerType: {
      control: 'select',
      options: ['button', 'paginator'],
      table: { defaultValue: { summary: 'button' } }
    },
    headingLevel: {
      control: 'select',
      options: [2, 3],
      table: { defaultValue: { summary: '2' } }
    },
    actions: { control: false },
    children: { control: false },
    filters: { control: false },
    footer: { control: false },
    search: { control: false }
  }
} as Meta<SectionProps>

export const Default: StoryObj<SectionProps> = {}

export const Simple: StoryObj<SectionProps> = {
  args: { simple: true }
}

export const ButtonFooter: StoryObj<SectionProps> = {
  args: {
    footer: (
      <Button color="neutral" size="medium" variant="ghost">
        Ver todos
      </Button>
    ),
    footerType: 'button'
  }
}
