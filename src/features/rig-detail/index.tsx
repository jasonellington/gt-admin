import { Link } from '@tanstack/react-router'
import { Server } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CrewSection } from './components/crew-section'
import { PolecatSection } from './components/polecat-section'
import { RigAgentCards } from './components/rig-agent-cards'
import { RigConvoySection } from './components/rig-convoy-section'
import { mockRigs, mockAgents, mockCrew, mockConvoys } from '@/features/town-dashboard/data/mock-data'

interface RigDetailProps {
  rigName: string
}

export function RigDetail({ rigName }: RigDetailProps) {
  const rig = mockRigs.find((r) => r.name === rigName)

  if (!rig) {
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
          <div className='flex flex-col items-center justify-center py-20'>
            <h1 className='text-2xl font-bold'>Rig Not Found</h1>
            <p className='mt-2 text-muted-foreground'>
              No rig named "{rigName}" exists.
            </p>
            <Link
              to='/town'
              className='mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
            >
              Back to Dashboard
            </Link>
          </div>
        </Main>
      </>
    )
  }

  // Filter agents and crew for this rig
  const rigAgents = mockAgents.filter((a) => a.rig === rigName)
  const witness = rigAgents.find((a) => a.role === 'witness')
  const refinery = rigAgents.find((a) => a.role === 'refinery')

  // Filter convoys that belong to this rig (for now, show all since convoys don't have rig field yet)
  const rigConvoys = mockConvoys

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/town'>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{rigName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Rig Header */}
        <div className='mb-6 flex items-center gap-4'>
          <Server className='h-8 w-8 text-muted-foreground' />
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{rigName}</h1>
            <p className='text-muted-foreground'>
              {rig.polecatCount} polecats, {rig.crewCount} crew
            </p>
          </div>
        </div>

        {/* Witness/Refinery Status Cards */}
        <RigAgentCards witness={witness} refinery={refinery} rigName={rigName} />

        {/* Main Content Grid */}
        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          {/* Crew Agents */}
          <CrewSection crew={mockCrew} rigName={rigName} />

          {/* Polecats */}
          <PolecatSection rigName={rigName} polecatCount={rig.polecatCount} />
        </div>

        {/* Convoys */}
        <div className='mt-6'>
          <RigConvoySection convoys={rigConvoys} rigName={rigName} />
        </div>
      </Main>
    </>
  )
}
