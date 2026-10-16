import { render, screen } from '@testing-library/react'
import SectionRoute from './page'

// why: full replacement — the session check is the subject; its own logic is covered in lib/server.
jest.mock('~/lib/server/session', () => ({
  verifySession: jest.fn()
}))

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

import { notFound } from 'next/navigation'
import { verifySession } from '~/lib/server/session'

const mockVerifySession = jest.mocked(verifySession)

const session = {
  accessToken: 'access-fake',
  accessTokenExpiraEm: '2999-01-01T00:00:00Z',
  refreshToken: 'refresh-fake',
  rememberMe: false
}

const paramsOf = (section: string) => ({ params: Promise.resolve({ section }) })

beforeEach(() => {
  jest.clearAllMocks()
  mockVerifySession.mockResolvedValue(session)
})

describe('[section] — C26: the areas without a screen yet', () => {
  it.each(['home', 'teaching', 'management', 'settings'])(
    '/%s renders "Em construção" after verifySession',
    async section => {
      render(await SectionRoute(paramsOf(section)))

      expect(
        screen.getByRole('heading', { name: 'Em construção' })
      ).toBeInTheDocument()
      expect(mockVerifySession).toHaveBeenCalledTimes(1)
      expect(notFound).not.toHaveBeenCalled()
    }
  )

  it('any other segment is a 404', async () => {
    await expect(SectionRoute(paramsOf('qualquer-coisa'))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it('does not render when verifySession redirects', async () => {
    mockVerifySession.mockRejectedValue(new Error('NEXT_REDIRECT /login'))

    await expect(SectionRoute(paramsOf('home'))).rejects.toThrow(
      'NEXT_REDIRECT /login'
    )
  })
})

describe('[section] — C11: the old pt-BR paths are 404', () => {
  it.each(['pessoas', 'inicio', 'ensino', 'gestao', 'configuracoes'])(
    'C11 /%s is a 404',
    async section => {
      await expect(SectionRoute(paramsOf(section))).rejects.toThrow(
        'NEXT_NOT_FOUND'
      )
      expect(notFound).toHaveBeenCalledTimes(1)
    }
  )
})
