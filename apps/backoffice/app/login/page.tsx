import { LoginPage } from './LoginPage'

type Props = { searchParams: Promise<{ session?: string | string[] }> }

export default async function Page({ searchParams }: Props) {
  const { session } = await searchParams
  return <LoginPage sessionExpired={session === 'expired'} />
}
