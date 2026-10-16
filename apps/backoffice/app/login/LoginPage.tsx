'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Button } from '@church/ui/atoms/Button'
import { Checkbox } from '@church/ui/atoms/Checkbox'
import { Logo } from '@church/ui/atoms/Logo'
import { TextField } from '@church/ui/atoms/TextField'
import { Typography } from '@church/ui/atoms/Typography'
import { login, type LoginFailure } from '~/app/actions/auth'

const schema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter ao menos um número')
})

type FormValues = z.infer<typeof schema>

type Props = { sessionExpired?: boolean }

const SESSION_EXPIRED_TOAST = 'session-expired'

export function LoginPage({ sessionExpired = false }: Props) {
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (!sessionExpired) return
    toast.info('Sua sessão expirou. Entre novamente.', {
      toastId: SESSION_EXPIRED_TOAST
    })
  }, [sessionExpired])

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(schema),
    shouldFocusError: false
  })

  const onSubmit = async (values: FormValues) => {
    let failure: LoginFailure | undefined
    try {
      failure = await login({ ...values, rememberMe: rememberMe })
    } catch {
      failure = { message: 'Algo deu errado. Tente novamente em instantes.' }
    }
    // why: on success the action redirects to /people and returns nothing.
    if (failure) toast.error(failure.message)
  }

  return (
    <main className="bg-canvas flex min-h-screen items-center justify-center p-4">
      <div className="bg-surface flex w-full max-w-sm flex-col gap-6 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-3">
          <Logo className="h-14" variant="symbol" />
          <div className="flex flex-col items-center gap-1 text-center">
            <Typography as="h1" variant="d3">
              Bem-vindo de volta
            </Typography>
            <Typography as="p" variant="p2">
              Sistema de gestão Filadéfia
            </Typography>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            autoComplete="email"
            control={control}
            label="E-mail"
            name="email"
            onFocus={() => clearErrors('email')}
            placeholder="Digite seu email"
            type="text"
          />

          <TextField
            autoComplete="current-password"
            control={control}
            label="Senha"
            name="password"
            onFocus={() => clearErrors('password')}
            placeholder="Digite sua senha"
            type="password"
          />

          <Checkbox
            checked={rememberMe}
            label="Lembrar de mim"
            onCheckedChange={setRememberMe}
            size="small"
          />

          <div className="flex flex-col gap-2">
            <Button
              color="accent"
              disabled={isSubmitting}
              size="medium"
              type="submit"
              variant="filled"
            >
              Entrar
            </Button>

            <Button color="neutral" size="medium" type="button" variant="ghost">
              Esqueceu a senha?
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
