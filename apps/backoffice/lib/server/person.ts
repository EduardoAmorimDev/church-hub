import 'server-only'

import type {
  PersonAddress,
  Gender,
  PersonDetail,
  PersonInput,
  MemberStatus
} from '~/types/members'

// hazard: `/core/pessoas` serialises the domain entity as-is, so every field
// carries a `_` prefix and dates are `{ _valor }`. Provisional contract
// (task pessoas-gestao-iteracao, Decided 5); nothing past the BFF sees it.
type RawRecord = Record<string, unknown>

const GENDERS: ReadonlyArray<Gender> = ['masculino', 'feminino', 'outro']

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const text = (value: unknown): string =>
  typeof value === 'string' ? value : ''

/** `yyyy-MM-dd` → the `yyyy/MM/dd` the backend parses (doc §8). */
export function toBackendDate(iso: string): string {
  return iso.replaceAll('-', '/')
}

function fromBackendDate(value: unknown): string | null {
  const raw = isRecord(value) ? value._valor : value
  if (typeof raw !== 'string') return null
  const match = /^(\d{4})[-/](\d{2})[-/](\d{2})/.exec(raw)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null
}

function fromBackendAddress(value: unknown): PersonAddress | null {
  if (!isRecord(value)) return null
  return {
    cep: text(value._cep),
    rua: text(value._rua),
    numero: text(value._numero),
    complemento: text(value._complemento),
    bairro: text(value._bairro),
    cidade: text(value._cidade),
    estado: text(value._estado),
    pais: text(value._pais)
  }
}

/** Maps the raw `/core/pessoas/:id` body; `null` when it is not a person. */
export function fromBackendPerson(raw: unknown): PersonDetail | null {
  if (!isRecord(raw) || typeof raw._id !== 'string') return null
  const gender = GENDERS.find(value => value === raw._genero) ?? null
  const status: MemberStatus = raw._status === 'inativo' ? 'inativo' : 'ativo'
  return {
    id: raw._id,
    nome: text(raw._nome),
    cpf: text(raw._cpf),
    dataNascimento: fromBackendDate(raw._dataNascimento),
    genero: gender,
    email: text(raw._email),
    telefone: text(raw._telefone),
    endereco: fromBackendAddress(raw._endereco),
    profissao: text(raw._profissao),
    escolaridade: text(raw._escolaridade),
    estadoCivil: text(raw._estadoCivil),
    status
  }
}

/** The body `POST`/`PATCH /core/pessoas` expect. */
export function toBackendPerson(input: PersonInput) {
  return { ...input, dataNascimento: toBackendDate(input.dataNascimento) }
}
