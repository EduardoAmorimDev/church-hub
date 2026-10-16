'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@church/ui/atoms/Badge'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { SearchField } from '@church/ui/atoms/SearchField'
import { EmptyState } from '@church/ui/molecules/EmptyState'
import { Paginator } from '@church/ui/molecules/Paginator'
import { StatCard } from '@church/ui/molecules/StatCard'
import { toast } from '@church/ui/molecules/Toast'
import { Section } from '@church/ui/organisms/Section'
import { Table } from '@church/ui/organisms/Table'
import type { ColumnDefinition, TableRowData } from '@church/ui/organisms/Table'
import { PageBody } from '@church/ui/templates/Page'
import { formatPhone } from '~/lib/format'
import { membersService } from '~/services/members'
import type { MemberItem, MembersResponse } from '~/types/members'
import { MemberDrawer } from './MemberDrawer'
import { MemberFormDialog, type MemberFormTarget } from './MemberFormDialog'

type StatsState = {
  total: number | null
  active: number | null
  inactive: number | null
}

// why: the backend returns neither the GC nor the joining date yet; the
// columns stay as a reminder (task Out of scope, backend request).
const TO_DO = 'a fazer'

const COLUMNS: ReadonlyArray<ColumnDefinition> = [
  { id: 'member', header: 'Membro' },
  { id: 'contact', header: 'Contato' },
  { id: 'group', header: 'Grupo de Crescimento' },
  { id: 'joinedAt', header: 'Data de ingresso' },
  { id: 'status', header: 'Situação' },
  { id: 'actions', header: 'Ações', reorderable: false }
]

type RowHandlers = {
  onView: (member: MemberItem) => void
  onEdit: (member: MemberItem) => void
  onDeactivate: (member: MemberItem) => void
}

function makeRows(
  members: MemberItem[],
  { onEdit, onDeactivate, onView }: RowHandlers
): TableRowData[] {
  return members.map(m => {
    const phone = formatPhone(m.telefone)
    return {
      id: m.id,
      cells: {
        member: { type: 'avatar', label: m.nome },
        contact: m.email
          ? { type: 'default', label: m.email, paragraph: phone }
          : { type: 'default', label: phone },
        group: { type: 'default', label: TO_DO },
        joinedAt: { type: 'default', label: TO_DO },
        status: {
          type: 'tag',
          tag: (
            <Badge color="neutral">
              {m.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          )
        },
        actions: {
          type: 'action',
          actions: [
            {
              'aria-label': 'Ver membro',
              icon: <Icon name="visibility" />,
              onClick: () => onView(m)
            },
            {
              'aria-label': 'Mais ações',
              icon: <Icon name="more_vert" />,
              menu: [
                {
                  iconName: 'edit',
                  label: 'Editar',
                  onSelect: () => onEdit(m)
                },
                {
                  disabled: m.status === 'inativo',
                  iconName: 'person_off',
                  label: 'Inativar',
                  onSelect: () => onDeactivate(m)
                }
              ]
            }
          ]
        }
      }
    }
  })
}

export function PeoplePage() {
  const [stats, setStats] = useState<StatsState>({
    total: null,
    active: null,
    inactive: null
  })
  const [members, setMembers] = useState<MembersResponse | null>(null)
  const [loadingTable, setLoadingTable] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [version, setVersion] = useState(0)
  const [viewed, setViewed] = useState<MemberItem | null>(null)
  const [formTarget, setFormTarget] = useState<MemberFormTarget | null>(null)

  useEffect(() => {
    void Promise.all([
      membersService.list({ limit: 1 }),
      membersService.list({ limit: 1, status: 'ativo' }),
      membersService.list({ limit: 1, status: 'inativo' })
    ])
      .then(([total, active, inactive]) => {
        setStats({
          total: total?.total ?? 0,
          active: active?.total ?? 0,
          inactive: inactive?.total ?? 0
        })
      })
      // why: the HTTP layer already toasted the failure; the cards keep '—'.
      .catch(() => {})
  }, [version])

  useEffect(() => {
    setLoadingTable(true)
    void membersService
      .list({ page, limit: pageSize })
      .then(result => {
        setMembers(result)
      })
      .catch(() => {})
      .finally(() => {
        setLoadingTable(false)
      })
  }, [page, pageSize, version])

  const reload = useCallback(() => setVersion(v => v + 1), [])
  const closeForm = useCallback(() => setFormTarget(null), [])

  const deactivate = async (member: MemberItem) => {
    let existed: boolean
    try {
      existed = await membersService.deactivate(member.id)
    } catch {
      // why: the HTTP layer already toasted the failure; nothing changed.
      return
    }
    if (existed) toast.success({ title: 'Membro inativado.' })
    reload()
  }

  const rows = makeRows(members?.data ?? [], {
    onEdit: member => setFormTarget({ kind: 'edit', id: member.id }),
    onDeactivate: member => void deactivate(member),
    onView: setViewed
  })

  return (
    <PageBody
      stats={
        <>
          <StatCard label="Total de membros" value={stats.total ?? '—'} />
          <StatCard label="Ativos" value={stats.active ?? '—'} />
          <StatCard label="Inativos" value={stats.inactive ?? '—'} />
        </>
      }
    >
      <Section
        filters={
          <Button
            color="neutral"
            onClick={() => setFormTarget({ kind: 'create' })}
            startIcon={<Icon name="add" />}
            variant="filled"
          >
            Adicionar membro
          </Button>
        }
        footer={
          <Paginator
            onPageChange={setPage}
            onPageSizeChange={nextSize => {
              setPageSize(nextSize)
              setPage(1)
            }}
            page={page}
            pageSize={pageSize}
            totalItems={members?.total ?? 0}
          />
        }
        footerType="paginator"
        search={
          // hazard: disabled until GET /admin/membros filters by name (task
          // Out of scope, backend request).
          <SearchField disabled placeholder="Buscar membro" />
        }
        title="Membros"
        titleHidden
      >
        <Table
          caption="Lista de membros"
          captionHidden
          columns={COLUMNS}
          emptyContent={
            <EmptyState size="small" title="Nenhum membro encontrado" />
          }
          rows={rows}
          selectable={false}
          state={loadingTable ? 'loading' : 'default'}
        />
      </Section>
      <MemberDrawer
        member={viewed}
        onClose={() => setViewed(null)}
        onEdit={member => {
          setViewed(null)
          setFormTarget({ kind: 'edit', id: member.id })
        }}
      />
      <MemberFormDialog
        target={formTarget}
        onClose={closeForm}
        onSaved={reload}
      />
    </PageBody>
  )
}
