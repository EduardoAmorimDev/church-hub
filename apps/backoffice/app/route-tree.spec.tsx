import fs from 'node:fs'
import path from 'node:path'
import { isValidElement } from 'react'
import PanelLayout from './(panel)/layout'
import { AppShell } from './(panel)/AppShell'

// why: full replacement — the server action pulls iron-session, which does
// not load under jsdom; only the route layout is under test here.
jest.mock('~/app/actions/auth', () => ({
  logout: jest.fn()
}))

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  connection: jest.fn(async () => undefined)
}))

import { connection } from 'next/server'

const APP = __dirname
const exists = (...segments: string[]) =>
  fs.existsSync(path.join(APP, ...segments))

describe('route tree — C22: only the (panel) group gets the shell', () => {
  it('the (panel) layout waits for the request and wraps its children in the AppShell', async () => {
    const child = <p>Conteúdo</p>
    const element = await PanelLayout({ children: child })

    expect(connection).toHaveBeenCalledTimes(1)
    expect(isValidElement(element) && element.type).toBe(AppShell)
    expect(
      isValidElement<{ children: unknown }>(element) && element.props.children
    ).toBe(child)
  })

  it('/login and / live outside the (panel) group', () => {
    expect(exists('login', 'page.tsx')).toBe(true)
    expect(exists('page.tsx')).toBe(true)
    expect(exists('(panel)', 'login')).toBe(false)
    expect(exists('(panel)', 'page.tsx')).toBe(false)
  })

  it('the authenticated pages live inside the (panel) group', () => {
    expect(exists('(panel)', 'people', 'page.tsx')).toBe(true)
    expect(exists('(panel)', '[section]', 'page.tsx')).toBe(true)
    expect(exists('people')).toBe(false)
  })

  it('C17 people has no [id] route: the member opens in a drawer', () => {
    expect(exists('(panel)', 'people', '[id]')).toBe(false)
  })

  it('the root layout does not use the AppShell', () => {
    const root = fs.readFileSync(path.join(APP, 'layout.tsx'), 'utf8')

    expect(root).not.toMatch(/AppShell|@church\/ui\/templates\/Page/)
  })
})
