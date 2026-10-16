import { SESSION_COOKIE } from '~/lib/server/session'
import {
  createCookieStore,
  minutesFromNow,
  sealSession,
  type FakeCookieStore
} from '~/test/session'

/** A cookie store holding a valid, non-expiring-soon session. */
export async function signedInStore(): Promise<FakeCookieStore> {
  return createCookieStore({
    [SESSION_COOKIE]: await sealSession({
      accessToken: 'access-fake',
      accessTokenExpiraEm: minutesFromNow(15),
      refreshToken: 'refresh-fake',
      rememberMe: false
    })
  })
}

export const SESSION_EXPIRED_BODY = {
  message: 'Sua sessão expirou. Entre novamente.'
}
