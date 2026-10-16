export type MemberStatus = 'ativo' | 'inativo'

export type MemberItem = {
  id: string
  nome: string
  email: string | null
  telefone: string
  bairro: string | null
  status: MemberStatus
  origemCadastro: string
}

export type MembersResponse = {
  data: MemberItem[]
  total: number
  page: number
}

export type Gender = 'masculino' | 'feminino' | 'outro'

export type PersonAddress = {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  pais: string
}

/** invariant: dates are ISO `yyyy-MM-dd`; the BFF converts to the backend's
 * `yyyy/MM/dd` and back. */
export type PersonInput = {
  nome: string
  cpf: string
  dataNascimento: string
  genero: Gender
  email: string
  telefone: string
  endereco: PersonAddress
  profissao: string
  escolaridade: string
  estadoCivil: string
}

/** A person as `/core/pessoas/:id` describes it, without the `_` prefixes. */
export type PersonDetail = Omit<
  PersonInput,
  'dataNascimento' | 'genero' | 'endereco'
> & {
  id: string
  dataNascimento: string | null
  genero: Gender | null
  endereco: PersonAddress | null
  status: MemberStatus
}
