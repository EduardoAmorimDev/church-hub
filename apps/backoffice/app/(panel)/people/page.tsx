import { Tabs } from '@church/ui/molecules/Tabs'
import { PageHeader } from '@church/ui/organisms/PageHeader'
import { PageBody } from '@church/ui/templates/Page'
import { verifySession } from '~/lib/server/session'
import { currentPeopleTab, buildPeopleTabs } from '~/lib/navigation'
import { UnderConstruction } from '../UnderConstruction'
import { PeoplePage } from './PeoplePage'

type Props = { searchParams: Promise<{ tab?: string | string[] }> }

export default async function Page({ searchParams }: Props) {
  await verifySession()
  const { tab } = await searchParams

  return (
    <>
      <PageHeader
        tabs={<Tabs items={buildPeopleTabs(tab)} label="Seções de pessoas" />}
        title="Gestão de pessoas"
      />
      {currentPeopleTab(tab) === 'members' ? (
        <PeoplePage />
      ) : (
        <PageBody>
          <UnderConstruction />
        </PageBody>
      )}
    </>
  )
}
