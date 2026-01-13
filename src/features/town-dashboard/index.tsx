import { useMemo } from 'react'
import { Building2, Server, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RigList } from './components/rig-list'
import { AgentList } from './components/agent-list'
import { ConvoyList } from './components/convoy-list'
import { useAgentStatuses } from './hooks/use-agent-statuses'
import {
  mockTown,
  mockRigs,
  mockAgents,
  mockCrew,
  mockConvoys,
} from './data/mock-data'

export function TownDashboard() {
  const { getStatus } = useAgentStatuses()

  // Merge mock agents with real statuses
  const agents = useMemo(
    () =>
      mockAgents.map((agent) => ({
        ...agent,
        status: getStatus(agent.name),
      })),
    [getStatus]
  )

  const totalAgents = agents.length
  const onlineAgents = agents.filter((a) => a.status === 'online').length

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Gas Town Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Monitor rigs, agents, and convoys
          </p>
        </div>

        {/* Summary Cards */}
        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Town</CardTitle>
              <Building2 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{mockTown.name}</div>
              <p className='text-xs text-muted-foreground truncate'>
                {mockTown.path}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Overseer</CardTitle>
              <span className='text-lg'>{mockTown.overseer.icon}</span>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{mockTown.overseer.name.split(' ')[0]}</div>
              <p className='text-xs text-muted-foreground'>
                {mockTown.overseer.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rigs</CardTitle>
              <Server className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{mockRigs.length}</div>
              <p className='text-xs text-muted-foreground'>
                {mockRigs.reduce((acc, r) => acc + r.polecatCount, 0)} polecats,{' '}
                {mockRigs.reduce((acc, r) => acc + r.crewCount, 0)} crew
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Agents</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalAgents}</div>
              <p className='text-xs text-muted-foreground'>
                {onlineAgents} online, {totalAgents - onlineAgents} offline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className='mb-6 grid gap-4 lg:grid-cols-2'>
          <RigList rigs={mockRigs} />
          <AgentList agents={agents} crew={mockCrew} />
        </div>

        {/* Convoys */}
        <ConvoyList convoys={mockConvoys} />
      </Main>
    </>
  )
}
