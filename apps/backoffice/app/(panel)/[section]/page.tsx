import { notFound } from 'next/navigation'
import { verifySession } from '~/lib/server/session'
import { isUnderConstructionSection } from '~/lib/navigation'
import { UnderConstruction } from '../UnderConstruction'

type Props = { params: Promise<{ section: string }> }

export default async function Page({ params }: Props) {
  await verifySession()
  const { section } = await params
  if (!isUnderConstructionSection(section)) notFound()
  return <UnderConstruction />
}
