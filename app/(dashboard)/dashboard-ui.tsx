'use client'
import { useEffect } from 'react'
import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDashboard, IconWallet, IconUser, IconLogout } from '@tabler/icons-react'
import { SkullLoader } from '@/components/ui/SkullLoader'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import Loading from '../loading'

export default function DashboardUI({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure()
  const pathname = usePathname()
  // const router = useRouter()

  const { user, loading, logout } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) return null

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      className="bg-[#101113]"
    >
      <AppShell.Header bg="#1A1B1E" className="border-b border-gray-800">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <Text fw={900} size="lg" className="tracking-widest text-gray-200">
              DARK CAPITAL
            </Text>
          </Group>
          <Group visibleFrom="sm">
            <Text size="xs" c="dimmed" ta="right">
              Logged in as
              <br />
              <span className="text-white font-bold">{user.email}</span>
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="#141517" className="border-r border-gray-800">
        <div className="flex-1">
          <Text size="xs" c="dimmed" mb="sm" fw={700} tt="uppercase">
            Operations
          </Text>

          <NavLink
            component={Link}
            href="/"
            label="Investments"
            leftSection={<IconDashboard size="1rem" stroke={1.5} />}
            active={pathname === '/'}
            variant="filled"
            color="gray"
            className="rounded-md mb-2 text-gray-300 hover:bg-[#2C2E33]"
          />

          <NavLink
            component={Link}
            href="/portfolio"
            label="My Portfolio"
            leftSection={<IconWallet size="1rem" stroke={1.5} />}
            active={pathname === '/portfolio'}
            variant="filled"
            color="gray"
            className="rounded-md mb-2 text-gray-300 hover:bg-[#2C2E33]"
          />

          <NavLink
            component={Link}
            href="/profile"
            label="Profile Settings"
            leftSection={<IconUser size="1rem" stroke={1.5} />}
            active={pathname === '/profile'}
            variant="filled"
            color="gray"
            className="rounded-md mb-2 text-gray-300 hover:bg-[#2C2E33]"
          />
        </div>

        <div className="border-t border-gray-800 pt-4">
          <NavLink
            label="Terminate Session"
            leftSection={<IconLogout size="1rem" stroke={1.5} />}
            onClick={() => logout()}
            className="rounded-md text-red-400 hover:bg-red-900/20 hover:text-red-300"
          />
        </div>
      </AppShell.Navbar>

      <AppShell.Main bg="#101113">{children}</AppShell.Main>
    </AppShell>
  )
}
