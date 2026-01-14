import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

interface AgentRow {
  id: string
  name: string
  type: string
  rig: string | null
  currentBead: string | null
  online: boolean
  icon: string
}

function StatusBadge({ online }: { online: boolean }) {
  if (online) {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'>
        <span className='mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500' />
        Online
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='text-muted-foreground'>
      <span className='mr-1.5 inline-block h-2 w-2 rounded-full bg-muted-foreground/50' />
      Offline
    </Badge>
  )
}

export function AgentsPage() {
  const { status, loading, error } = useTownStatus()

  // Transform town status into a flat list of agents
  const agents: AgentRow[] = []

  if (status) {
    // Town-level agents (mayor, deacon)
    for (const agent of status.townAgents) {
      agents.push({
        id: agent.name,
        name: agent.name,
        type: agent.type,
        rig: null,
        currentBead: null,
        online: agent.online,
        icon: agent.icon,
      })
    }

    // Rig-level agents
    for (const rig of status.rigs) {
      // Witness
      agents.push({
        id: `${rig.name}-witness`,
        name: 'witness',
        type: 'witness',
        rig: rig.name,
        currentBead: null,
        online: rig.witness.online,
        icon: '🦉',
      })

      // Refinery
      agents.push({
        id: `${rig.name}-refinery`,
        name: 'refinery',
        type: 'refinery',
        rig: rig.name,
        currentBead: null,
        online: rig.refinery.online,
        icon: '🏭',
      })

      // Polecats
      for (const polecat of rig.polecats) {
        agents.push({
          id: `${rig.name}-polecat-${polecat.name}`,
          name: polecat.name,
          type: 'polecat',
          rig: rig.name,
          currentBead: null,
          online: polecat.online,
          icon: '😺',
        })
      }

      // Crew
      for (const member of rig.crew) {
        agents.push({
          id: `${rig.name}-crew-${member.name}`,
          name: member.name,
          type: 'crew',
          rig: rig.name,
          currentBead: null,
          online: member.online,
          icon: '👷',
        })
      }
    }
  }

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
                <BreadcrumbPage>Agents</BreadcrumbPage>
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
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
            <Users className='h-6 w-6' />
            Agents
          </h1>
          <p className='text-muted-foreground'>
            All worker processes across the town
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className='py-8 text-center text-muted-foreground'>
              Loading agents...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className='py-8 text-center text-destructive'>
              {error}
            </CardContent>
          </Card>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
              <h3 className='mt-4 text-lg font-medium'>No agents found</h3>
              <p className='mt-2 text-sm text-muted-foreground'>
                Start some agents to see them listed here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rig</TableHead>
                  <TableHead>Current Bead</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <Link
                        to='/agents/$agentId'
                        params={{ agentId: agent.id }}
                        className='flex items-center gap-2 hover:underline'
                      >
                        <span>{agent.icon}</span>
                        <span className='font-medium'>{agent.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='capitalize'>
                        {agent.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {agent.rig ? (
                        <Link
                          to='/rigs/$rigId'
                          params={{ rigId: agent.rig }}
                          className='text-sm hover:underline'
                        >
                          {agent.rig}
                        </Link>
                      ) : (
                        <span className='text-muted-foreground'>Town</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.currentBead ? (
                        <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                          {agent.currentBead}
                        </code>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge online={agent.online} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Main>
    </>
  )
}
