import { connection } from 'next/server'
import { AppShell } from './AppShell'

export default async function PanelLayout({
  children
}: {
  children: React.ReactNode
}) {
  // why: every page here depends on the session cookie, and the AppShell reads
  // useSearchParams, which fails a prerender outside a Suspense boundary.
  await connection()
  return <AppShell>{children}</AppShell>
}
