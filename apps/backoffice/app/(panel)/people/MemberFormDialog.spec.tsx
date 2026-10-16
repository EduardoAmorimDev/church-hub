import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemberFormDialog, type MemberFormTarget } from './MemberFormDialog'

jest.mock('@church/ui/molecules/Toast', () => ({
  ...jest.requireActual('@church/ui/molecules/Toast'),
  toast: { success: jest.fn(), error: jest.fn() }
}))

// why: full replacement — the dialog is checked against the service contract, not HTTP.
jest.mock('~/services/members', () => ({
  membersService: {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

import { toast } from '@church/ui/molecules/Toast'
import { membersService } from '~/services/members'
import { fakePersonInput } from '~/test/person'
import type { PersonDetail } from '~/types/members'

const mockGet = jest.mocked(membersService.get)
const mockCreate = jest.mocked(membersService.create)
const mockUpdate = jest.mocked(membersService.update)

const fakePerson: PersonDetail = {
  ...fakePersonInput,
  id: 'id-001',
  status: 'ativo'
}

const TEXT_FIELDS = [
  'Nome',
  'CPF',
  'E-mail',
  'Telefone',
  'CEP',
  'Rua',
  'Número',
  'Complemento',
  'Bairro',
  'Cidade',
  'Estado',
  'País',
  'Profissão',
  'Escolaridade',
  'Estado civil'
]

const REQUIRED = [
  'Nome',
  'CPF',
  'Data de nascimento',
  'Gênero',
  'E-mail',
  'Telefone',
  'CEP',
  'Rua',
  'Número',
  'Bairro',
  'Cidade',
  'Estado',
  'País'
]

function renderDialog(target: MemberFormTarget) {
  const onClose = jest.fn()
  const onSaved = jest.fn()
  render(
    <MemberFormDialog target={target} onClose={onClose} onSaved={onSaved} />
  )
  return { onClose, onSaved }
}

const dialogOf = (name: string) => screen.getByRole('dialog', { name })
// why: labels end with the required mark or "(Opcional)"; "Estado" must not
// also match "Estado civil".
const labelled = (label: string) =>
  new RegExp(`^${label}\\s*(\\*|\\(Opcional\\))?\\s*$`)
const field = (label: string) =>
  screen.getByRole('textbox', { name: labelled(label) })
const saveButton = () => screen.getByRole('button', { name: /Salvar/ })

async function chooseGender(label: string) {
  await userEvent.click(screen.getByRole('combobox', { name: /Gênero/ }))
  await userEvent.click(await screen.findByRole('option', { name: label }))
}

async function fillValid() {
  const values: ReadonlyArray<[string, string]> = [
    ['Nome', fakePersonInput.nome],
    ['CPF', fakePersonInput.cpf],
    ['E-mail', fakePersonInput.email],
    ['Telefone', fakePersonInput.telefone],
    ['CEP', fakePersonInput.endereco.cep],
    ['Rua', fakePersonInput.endereco.rua],
    ['Número', fakePersonInput.endereco.numero],
    ['Bairro', fakePersonInput.endereco.bairro],
    ['Cidade', fakePersonInput.endereco.cidade],
    ['Estado', fakePersonInput.endereco.estado]
  ]
  for (const [label, value] of values) {
    await userEvent.type(field(label), value)
  }
  await userEvent.type(field('Data de nascimento'), '31011990')
  await chooseGender('Feminino')
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('MemberFormDialog — C24: the create form', () => {
  it('C24 opens "Adicionar membro" with the contract fields and actions', () => {
    renderDialog({ kind: 'create' })
    const dialog = within(dialogOf('Adicionar membro'))

    for (const label of [...TEXT_FIELDS, 'Data de nascimento']) {
      expect(
        dialog.getByRole('textbox', { name: labelled(label) })
      ).toBeInTheDocument()
    }
    expect(dialog.getByRole('combobox', { name: /Gênero/ })).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: /Salvar/ })).toBeInTheDocument()
  })

  it('C24 offers Masculino, Feminino and Outro', async () => {
    renderDialog({ kind: 'create' })

    await userEvent.click(screen.getByRole('combobox', { name: /Gênero/ }))

    expect(
      (await screen.findAllByRole('option')).map(option => option.textContent)
    ).toEqual(['Masculino', 'Feminino', 'Outro'])
  })
})

describe('MemberFormDialog — C25: validation', () => {
  it('C25 every empty required field shows its error and nothing is sent', async () => {
    renderDialog({ kind: 'create' })
    await userEvent.clear(field('País'))

    await userEvent.click(saveButton())

    await waitFor(() =>
      expect(screen.getAllByText('Campo obrigatório')).toHaveLength(
        REQUIRED.length
      )
    )
    for (const label of REQUIRED.filter(name => name !== 'Gênero')) {
      expect(field(label)).toHaveAccessibleDescription(
        expect.stringContaining('Campo obrigatório')
      )
    }
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('C25 an e-mail without @ is rejected', async () => {
    renderDialog({ kind: 'create' })
    await fillValid()
    await userEvent.clear(field('E-mail'))
    await userEvent.type(field('E-mail'), 'pessoa.example.test')

    await userEvent.click(saveButton())

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('MemberFormDialog — C26: create', () => {
  it('C26 sends the input, locks while pending, then toasts and closes', async () => {
    let resolve: (value: PersonDetail) => void = () => {}
    mockCreate.mockReturnValue(
      new Promise(res => {
        resolve = res
      })
    )
    const { onClose, onSaved } = renderDialog({ kind: 'create' })
    await fillValid()

    await userEvent.click(saveButton())

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1))
    expect(mockCreate).toHaveBeenCalledWith({
      ...fakePersonInput,
      endereco: { ...fakePersonInput.endereco, pais: 'Brasil' }
    })
    expect(dialogOf('Adicionar membro')).toHaveAttribute('aria-busy', 'true')
    expect(saveButton()).toBeDisabled()
    await userEvent.click(saveButton())
    expect(mockCreate).toHaveBeenCalledTimes(1)

    resolve(fakePerson)

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(onSaved).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith({ title: 'Membro adicionado.' })
  })
})

describe('MemberFormDialog — C27/C28: edit', () => {
  it('C27 shows a loading state, then the current values', async () => {
    let resolve: (value: PersonDetail) => void = () => {}
    mockGet.mockReturnValue(
      new Promise(res => {
        resolve = res
      })
    )
    renderDialog({ kind: 'edit', id: 'id-001' })

    expect(dialogOf('Editar membro')).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Carregando membro' })
    ).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('id-001')

    resolve(fakePerson)

    expect(
      await screen.findByDisplayValue('Pessoa Exemplo')
    ).toBeInTheDocument()
    expect(field('CPF')).toHaveValue('000.000.000-00')
    expect(field('Data de nascimento')).toHaveValue('31/01/1990')
    expect(field('Rua')).toHaveValue('Rua Exemplo')
    expect(field('Bairro')).toHaveValue('Bairro Exemplo')
    expect(screen.getByRole('combobox', { name: /Gênero/ })).toHaveTextContent(
      'Feminino'
    )
  })

  it('C27 a member that no longer exists (204) closes and reloads', async () => {
    mockGet.mockResolvedValue(null)

    const { onClose, onSaved } = renderDialog({ kind: 'edit', id: 'id-001' })

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(onSaved).toHaveBeenCalled()
  })

  it('C28 saving patches with genero and the whole endereco, then toasts', async () => {
    mockGet.mockResolvedValue(fakePerson)
    mockUpdate.mockResolvedValue(fakePerson)
    const { onClose, onSaved } = renderDialog({ kind: 'edit', id: 'id-001' })
    await screen.findByDisplayValue('Pessoa Exemplo')
    await userEvent.clear(field('Nome'))
    await userEvent.type(field('Nome'), 'Pessoa Editada')

    await userEvent.click(saveButton())

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith('id-001', {
        ...fakePersonInput,
        nome: 'Pessoa Editada'
      })
    )
    const [, sent] = mockUpdate.mock.calls[0] ?? []
    expect(sent?.genero).toBe('feminino')
    expect(sent?.endereco).toEqual(fakePersonInput.endereco)
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(onSaved).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith({ title: 'Membro atualizado.' })
  })
})

describe('MemberFormDialog — C29: save failure', () => {
  it('C29 keeps the dialog open with the values and the buttons enabled', async () => {
    mockCreate.mockRejectedValue(new Error('HTTP 500'))
    const { onClose, onSaved } = renderDialog({ kind: 'create' })
    await fillValid()

    await userEvent.click(saveButton())

    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
    await waitFor(() => expect(saveButton()).toBeEnabled())
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    expect(dialogOf('Adicionar membro')).toBeInTheDocument()
    expect(field('Nome')).toHaveValue('Pessoa Exemplo')
    expect(onClose).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })
})
