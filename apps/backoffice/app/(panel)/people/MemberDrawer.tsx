'use client'

import { Avatar } from '@church/ui/atoms/Avatar'
import { Badge } from '@church/ui/atoms/Badge'
import { Button } from '@church/ui/atoms/Button'
import { Icon } from '@church/ui/atoms/Icon'
import { Drawer } from '@church/ui/organisms/Drawer'
import { formatPhone } from '~/lib/format'
import type { MemberItem } from '~/types/members'

type Props = {
  member: MemberItem | null
  onClose: () => void
  onEdit: (member: MemberItem) => void
}

const STATUS_LABEL = { ativo: 'Ativo', inativo: 'Inativo' } as const

// why: the drawer shows the row already loaded; the sections Figma draws
// without a backend source stay out (task Unresolved 5).
export function MemberDrawer({ member, onClose, onEdit }: Props) {
  if (!member) return null

  const contact = [
    { icon: 'call', label: 'Telefone', value: formatPhone(member.telefone) },
    { icon: 'mail', label: 'E-mail', value: member.email ?? '—' },
    { icon: 'location_on', label: 'Endereço', value: member.bairro ?? '—' }
  ] as const

  return (
    <Drawer
      headerActions={
        <Badge color="neutral">{STATUS_LABEL[member.status]}</Badge>
      }
      onClose={onClose}
      title={member.nome}
    >
      <div className="flex items-center gap-4">
        <Avatar alt={member.nome} aria-hidden="true" size="large" src="" />
        <Button
          color="neutral"
          onClick={() => onEdit(member)}
          size="medium"
          startIcon={<Icon name="edit" />}
          variant="filled"
        >
          Editar
        </Button>
      </div>
      <section aria-labelledby="member-contact" className="flex flex-col gap-3">
        <h3 className="text-size-75 m-0 font-semibold" id="member-contact">
          Informações de Contato
        </h3>
        <dl className="bg-page m-0 flex flex-col gap-4 rounded-2xl p-4">
          {contact.map(item => (
            <div className="flex items-start gap-3" key={item.label}>
              <Icon className="text-secondary" name={item.icon} />
              <div className="flex flex-col gap-0.5">
                <dt className="text-size-25 text-secondary">{item.label}</dt>
                <dd className="text-size-50 text-primary m-0">{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </Drawer>
  )
}
