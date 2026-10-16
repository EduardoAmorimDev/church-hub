'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { MenuItemProps } from '@church/ui/molecules/MenuDropdown'
import type { NavUser } from '@church/ui/organisms/SideMenu'
import { Page } from '@church/ui/templates/Page'
import { logout } from '~/app/actions/auth'
import { buildNavigation } from '~/lib/navigation'
import { profileService } from '~/services/profile'
import type { Role, Profile } from '~/types/profile'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  lider: 'Líder'
}

const PROFILE_MENU: MenuItemProps[] = [
  {
    iconName: 'logout',
    label: 'Sair',
    onSelect: () => {
      void logout()
    }
  }
]

function toNavUser(profile: Profile): NavUser {
  return {
    name: profile.name,
    role: profile.role ? ROLE_LABEL[profile.role] : undefined
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<NavUser>()

  useEffect(() => {
    void profileService
      .get()
      .then(profile => {
        if (profile) setUser(toNavUser(profile))
      })
      // why: the HTTP layer already toasted the failure; the footer simply
      // shows no profile.
      .catch(() => {})
  }, [])

  const nav = buildNavigation(pathname, searchParams.get('tab'))

  return (
    <Page nav={{ ...nav, profileMenuItems: PROFILE_MENU, user }}>
      {children}
    </Page>
  )
}
