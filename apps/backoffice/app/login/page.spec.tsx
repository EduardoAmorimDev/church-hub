import { render } from '@testing-library/react'
import LoginRoute from './page'

// why: full replacement — the Server Action runs on the server; its own spec covers it.
jest.mock('~/app/actions/auth', () => ({
  login: jest.fn()
}))

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: { error: jest.fn(), info: jest.fn() }
}))

import { toast } from 'react-toastify'

beforeEach(() => {
  jest.clearAllMocks()
})

async function renderRoute(session?: string | string[]) {
  render(await LoginRoute({ searchParams: Promise.resolve({ session }) }))
}

describe('login route — C30: ?session=expired reaches the notice', () => {
  it('shows the expired-session toast for ?session=expired', async () => {
    await renderRoute('expired')

    expect(toast.info).toHaveBeenCalledWith(
      'Sua sessão expirou. Entre novamente.',
      { toastId: 'session-expired' }
    )
  })

  it.each([undefined, 'outra', ['expired', 'expired']])(
    'stays silent for session=%p',
    async session => {
      await renderRoute(session)

      expect(toast.info).not.toHaveBeenCalled()
    }
  )
})

describe('login route — C9: ?session=expired shows the notice', () => {
  it('C9 toasts the unchanged pt-BR text with toastId session-expired', async () => {
    await renderRoute('expired')

    expect(toast.info).toHaveBeenCalledTimes(1)
    expect(toast.info).toHaveBeenCalledWith(
      'Sua sessão expirou. Entre novamente.',
      { toastId: 'session-expired' }
    )
  })

  it('C9 the old ?sessao=expirada value is silent', async () => {
    await renderRoute('expirada')

    expect(toast.info).not.toHaveBeenCalled()
  })
})
