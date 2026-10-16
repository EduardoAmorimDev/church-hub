import { redirect } from 'next/navigation'
import Home from './page'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn()
}))

describe('/ — C8: the root sends to /people', () => {
  it('C8 redirects to /people', () => {
    Home()

    expect(redirect).toHaveBeenCalledWith('/people')
  })
})
