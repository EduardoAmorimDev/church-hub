'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField } from '@church/ui/atoms/TextField'
import { toast } from '@church/ui/molecules/Toast'
import { DateField } from '@church/ui/organisms/DateField'
import { Dialog } from '@church/ui/organisms/Dialog'
import { Select } from '@church/ui/organisms/Select'
import { Spinner } from '@church/ui/atoms/Spinner'
import { personSchema, type PersonFormValues } from '~/lib/personSchema'
import { membersService } from '~/services/members'
import type { PersonDetail, PersonInput } from '~/types/members'

export type MemberFormTarget = { kind: 'create' } | { kind: 'edit'; id: string }

type Props = {
  /** invariant: `null` keeps the dialog closed. */
  target: MemberFormTarget | null
  onClose: () => void
  /** why: the list and the totals reload after a save or a vanished member.
   * invariant: stable (`useCallback`), as both callbacks are effect deps. */
  onSaved: () => void
}

const GENDERS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' }
]

const EMPTY: PersonFormValues = {
  nome: '',
  cpf: '',
  dataNascimento: null,
  genero: null,
  email: '',
  telefone: '',
  endereco: {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil'
  },
  profissao: '',
  escolaridade: '',
  estadoCivil: ''
}

function valuesOf(person: PersonDetail): PersonFormValues {
  return {
    nome: person.nome,
    cpf: person.cpf,
    dataNascimento: person.dataNascimento,
    genero: person.genero,
    email: person.email,
    telefone: person.telefone,
    endereco: person.endereco ?? EMPTY.endereco,
    profissao: person.profissao,
    escolaridade: person.escolaridade,
    estadoCivil: person.estadoCivil
  }
}

/** Create or edit a member through `/core/pessoas` (provisional, Decided 5). */
export function MemberFormDialog({ target, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { control, handleSubmit, reset } = useForm<
    PersonFormValues,
    unknown,
    PersonInput
  >({ defaultValues: EMPTY, resolver: zodResolver(personSchema) })

  const editedId = target?.kind === 'edit' ? target.id : null

  useEffect(() => {
    if (!target) return
    reset(EMPTY)
    if (!editedId) return

    let active = true
    setLoading(true)
    membersService
      .get(editedId)
      .then(person => {
        if (!active) return
        if (person) {
          reset(valuesOf(person))
          return
        }
        onSaved()
        onClose()
      })
      // why: the HTTP layer already toasted the failure.
      .catch(() => {
        if (active) onClose()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [target, editedId, onClose, onSaved, reset])

  const save = async (input: PersonInput) => {
    setSaving(true)
    try {
      const saved = editedId
        ? await membersService.update(editedId, input)
        : await membersService.create(input)
      if (editedId && saved === null) {
        onSaved()
        onClose()
        return
      }
      toast.success({
        title: editedId ? 'Membro atualizado.' : 'Membro adicionado.'
      })
      onSaved()
      onClose()
    } catch {
      // why: the HTTP layer already toasted it; the dialog keeps the values.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      loading={saving}
      onClose={onClose}
      open={target !== null}
      primaryAction={{
        disabled: loading,
        label: 'Salvar',
        onClick: () => void handleSubmit(save)()
      }}
      secondaryAction={{ label: 'Cancelar', onClick: onClose }}
      size="large"
      title={editedId ? 'Editar membro' : 'Adicionar membro'}
    >
      {loading ? (
        <div
          aria-label="Carregando membro"
          className="flex justify-center p-6"
          role="status"
        >
          <Spinner />
        </div>
      ) : (
        <form
          aria-label="Dados do membro"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          noValidate
          onSubmit={event => {
            event.preventDefault()
            void handleSubmit(save)()
          }}
        >
          <TextField control={control} label="Nome" name="nome" />
          <TextField control={control} label="CPF" name="cpf" />
          <DateField
            control={control}
            label="Data de nascimento"
            name="dataNascimento"
          />
          <Select
            control={control}
            label="Gênero"
            name="genero"
            options={GENDERS}
            placeholder="Selecione"
          />
          <TextField
            control={control}
            label="E-mail"
            name="email"
            type="email"
          />
          <TextField control={control} label="Telefone" name="telefone" />
          <TextField control={control} label="CEP" name="endereco.cep" />
          <TextField control={control} label="Rua" name="endereco.rua" />
          <TextField control={control} label="Número" name="endereco.numero" />
          <TextField
            control={control}
            label="Complemento"
            name="endereco.complemento"
            optional
          />
          <TextField control={control} label="Bairro" name="endereco.bairro" />
          <TextField control={control} label="Cidade" name="endereco.cidade" />
          <TextField control={control} label="Estado" name="endereco.estado" />
          <TextField control={control} label="País" name="endereco.pais" />
          <TextField
            control={control}
            label="Profissão"
            name="profissao"
            optional
          />
          <TextField
            control={control}
            label="Escolaridade"
            name="escolaridade"
            optional
          />
          <TextField
            control={control}
            label="Estado civil"
            name="estadoCivil"
            optional
          />
        </form>
      )}
    </Dialog>
  )
}
