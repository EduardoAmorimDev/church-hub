import { z } from 'zod'
import type { PersonInput } from '~/types/members'

const REQUIRED_MESSAGE = 'Campo obrigatório'

const required = z.string().trim().min(1, REQUIRED_MESSAGE)
const optional = z.string().trim()

// why: the Select and the DateField report `null` when empty, so these
// fields accept it as input and turn it into the "required" error.
function requiredNullable<T extends z.ZodType>(schema: T) {
  return schema.nullable().transform((value, ctx) => {
    if (value === null) {
      ctx.addIssue({ code: 'custom', message: REQUIRED_MESSAGE })
      return z.NEVER
    }
    return value
  })
}

/**
 * The member form and the BFF body share this schema: the fields of
 * `POST /core/pessoas` (docs/backend/ibfc-server.md §8) with the ones the
 * backend needs to answer anything but 500.
 */
export const personSchema = z.object({
  nome: required,
  cpf: required,
  dataNascimento: requiredNullable(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  ),
  genero: requiredNullable(z.enum(['masculino', 'feminino', 'outro'])),
  email: required.refine(value => value.includes('@'), 'E-mail inválido'),
  telefone: required,
  endereco: z.object({
    cep: required,
    rua: required,
    numero: required,
    complemento: optional,
    bairro: required,
    cidade: required,
    estado: required,
    pais: required
  }),
  profissao: optional,
  escolaridade: optional,
  estadoCivil: optional
}) satisfies z.ZodType<PersonInput, PersonFormValuesShape>

type PersonFormValuesShape = Omit<PersonInput, 'dataNascimento' | 'genero'> & {
  dataNascimento: string | null
  genero: PersonInput['genero'] | null
}

export type PersonFormValues = z.input<typeof personSchema>
