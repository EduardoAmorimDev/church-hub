import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

// why: full replacement — the Server Action runs on the server; its own spec covers it.
jest.mock('~/app/actions/auth', () => ({
  login: jest.fn()
}))

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: { error: jest.fn(), info: jest.fn() }
}))

import { login } from '~/app/actions/auth'
import { toast } from 'react-toastify'

const mockLogin = jest.mocked(login)

beforeEach(() => {
  jest.clearAllMocks()
})

async function submit(email: string, password: string) {
  await userEvent.type(screen.getByPlaceholderText('Digite seu email'), email)
  await userEvent.type(
    screen.getByPlaceholderText('Digite sua senha'),
    password
  )
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage — renders form', () => {
  it('renders heading, email field and submit button', () => {
    render(<LoginPage />)

    expect(
      screen.getByRole('heading', { name: 'Bem-vindo de volta' })
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})

describe('LoginPage — valid credentials → login action', () => {
  it('calls login with the form values and rememberMe, without a toast', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    await userEvent.click(screen.getByText('Lembrar de mim'))
    await submit('admin@example.test', 'SenhaFake123')

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@example.test',
        password: 'SenhaFake123',
        rememberMe: true
      })
    )
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('LoginPage — C7: action failure → toast.error(message)', () => {
  it('shows the message the action returns', async () => {
    mockLogin.mockResolvedValue({ message: 'E-mail ou senha inválidos.' })
    render(<LoginPage />)

    await submit('x@example.test', 'SenhaErrada123')

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('E-mail ou senha inválidos.')
    )
  })

  it('shows the generic message when the action itself throws', async () => {
    mockLogin.mockRejectedValue(new Error('SESSION_SECRET missing'))
    render(<LoginPage />)

    await submit('x@example.test', 'SenhaFake123')

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Algo deu errado. Tente novamente em instantes.'
      )
    )
  })
})

describe('LoginPage — C30: expired session notice', () => {
  it('shows the info toast once with a fixed toastId', () => {
    render(<LoginPage sessionExpired />)

    expect(toast.info).toHaveBeenCalledWith(
      'Sua sessão expirou. Entre novamente.',
      { toastId: 'session-expired' }
    )
  })

  it('shows nothing on a normal visit', () => {
    render(<LoginPage />)

    expect(toast.info).not.toHaveBeenCalled()
  })
})

describe('LoginPage — weak password → form validation error', () => {
  it('shows zod error and does not call login when password is too weak', async () => {
    render(<LoginPage />)

    await submit('admin@example.test', 'fraca')

    await waitFor(() =>
      expect(
        screen.getByText('A senha deve ter no mínimo 8 caracteres')
      ).toBeInTheDocument()
    )
    expect(mockLogin).not.toHaveBeenCalled()
  })
})

describe('LoginPage — focus clears field error', () => {
  it('removes the error message when the field is focused after a validation error', async () => {
    render(<LoginPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(screen.getByText('E-mail obrigatório')).toBeInTheDocument()
    )

    await userEvent.click(screen.getByPlaceholderText('Digite seu email'))

    await waitFor(() =>
      expect(screen.queryByText('E-mail obrigatório')).not.toBeInTheDocument()
    )
  })
})
