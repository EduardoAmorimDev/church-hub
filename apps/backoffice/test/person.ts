import type { PersonInput } from '~/types/members'

// invariant: synthetic values only (constitution, Principle V).
export const fakePersonInput: PersonInput = {
  nome: 'Pessoa Exemplo',
  cpf: '000.000.000-00',
  dataNascimento: '1990-01-31',
  genero: 'feminino',
  email: 'pessoa@example.test',
  telefone: '11900000000',
  endereco: {
    cep: '00000-000',
    rua: 'Rua Exemplo',
    numero: '0',
    complemento: '',
    bairro: 'Bairro Exemplo',
    cidade: 'Cidade Exemplo',
    estado: 'EX',
    pais: 'Brasil'
  },
  profissao: '',
  escolaridade: '',
  estadoCivil: ''
}

/** The raw entity `/core/pessoas` serialises (docs/backend §8). */
export const fakeRawPerson = {
  _id: 'fake-id-1',
  _nome: 'Pessoa Exemplo',
  _cpf: '000.000.000-00',
  _dataNascimento: { _valor: '1990-01-31T00:00:00.000-03:00' },
  _genero: 'feminino',
  _email: 'pessoa@example.test',
  _telefone: '11900000000',
  _endereco: {
    _rua: 'Rua Exemplo',
    _numero: '0',
    _complemento: '',
    _bairro: 'Bairro Exemplo',
    _cidade: 'Cidade Exemplo',
    _estado: 'EX',
    _pais: 'Brasil',
    _cep: '00000-000'
  },
  _profissao: null,
  _status: 'ativo',
  _origemCadastro: 'web'
}
