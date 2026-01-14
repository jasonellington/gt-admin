import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Eye,
  Play,
  Square,
  Bell,
  MoreHorizontal,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TownAgent {
  name: string
  type: string
  icon: string
  online: boolean
  mailCount: number
}

interface RigAgent {
  name: string
  online: boolean
}

interface Rig {
  name: string
  witness: { online: boolean; mailCount: number }
  refinery: { online: boolean; mqCount: number }
  crew: RigAgent[]
  polecats: RigAgent[]
}

interface AgentsTabProps {
  townAgents: TownAgent[]
  rigs: Rig[]
}

type AgentRow = {
  id: string
  name: string
  type: 'mayor' | 'deacon' | 'witness' | 'refinery' | 'polecat' | 'crew'
  icon: string
  rig: string | null
  online: boolean
  info: string
}

function StatusBadge({ online }: { online: boolean }) {
  return (
    <Badge
      variant={online ? 'default' : 'outline'}
      className={cn(
        online
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
          : 'text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'mr-1.5 inline-block h-2 w-2 rounded-full',
          online ? 'bg-emerald-500' : 'bg-muted-foreground/50'
        )}
      />
      {online ? 'Online' : 'Offline'}
    </Badge>
  )
}

function AgentActions({ agent }: { agent: AgentRow }) {
  const canStartStop = ['mayor', 'deacon', 'witness', 'refinery'].includes(agent.type)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <Link to='/agents/$agentId' params={{ agentId: agent.id }}>
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </Link>
        </DropdownMenuItem>
        {canStartStop && (
          <>
            {agent.online ? (
              <DropdownMenuItem className='text-destructive'>
                <Square className='mr-2 h-4 w-4' />
                Stop
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <Play className='mr-2 h-4 w-4' />
                Start
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem>
          <Bell className='mr-2 h-4 w-4' />
          Nudge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AgentsTable({ agents }: { agents: AgentRow[] }) {
  if (agents.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Users className='h-12 w-12 text-muted-foreground/50' />
        <p className='mt-4 text-sm font-medium text-muted-foreground'>
          No agents found
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Rig</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Info</TableHead>
          <TableHead className='w-[70px]'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow key={agent.id}>
            <TableCell>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{agent.icon}</span>
                <span className='font-medium'>{agent.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant='outline' className='capitalize'>
                {agent.type}
              </Badge>
            </TableCell>
            <TableCell>
              {agent.rig ? (
                <span className='text-sm'>{agent.rig}</span>
              ) : (
                <span className='text-sm text-muted-foreground'>Town</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge online={agent.online} />
            </TableCell>
            <TableCell>
              <span className='text-sm text-muted-foreground'>{agent.info}</span>
            </TableCell>
            <TableCell>
              <AgentActions agent={agent} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function AgentsTab({ townAgents, rigs }: AgentsTabProps) {
  const [activeTab, setActiveTab] = useState('all')

  // Build flat list of all agents
  const allAgents: AgentRow[] = []

  // Town agents
  townAgents.forEach((agent) => {
    allAgents.push({
      id: agent.name,
      name: agent.name,
      type: agent.type as AgentRow['type'],
      icon: agent.icon,
      rig: null,
      online: agent.online,
      info: agent.mailCount > 0 ? `${agent.mailCount} mail` : '',
    })
  })

  // Rig agents
  rigs.forEach((rig) => {
    // Witness
    allAgents.push({
      id: `${rig.name}-witness`,
      name: 'witness',
      type: 'witness',
      icon: '🦉',
      rig: rig.name,
      online: rig.witness.online,
      info: rig.witness.mailCount > 0 ? `${rig.witness.mailCount} mail` : '',
    })

    // Refinery
    allAgents.push({
      id: `${rig.name}-refinery`,
      name: 'refinery',
      type: 'refinery',
      icon: '🏭',
      rig: rig.name,
      online: rig.refinery.online,
      info: rig.refinery.mqCount > 0 ? `MQ: ${rig.refinery.mqCount}` : '',
    })

    // Crew
    rig.crew.forEach((member) => {
      allAgents.push({
        id: `${rig.name}-crew-${member.name}`,
        name: member.name,
        type: 'crew',
        icon: '👷',
        rig: rig.name,
        online: member.online,
        info: '',
      })
    })

    // Polecats
    rig.polecats.forEach((polecat) => {
      allAgents.push({
        id: `${rig.name}-polecat-${polecat.name}`,
        name: polecat.name,
        type: 'polecat',
        icon: '😺',
        rig: rig.name,
        online: polecat.online,
        info: '',
      })
    })
  })

  // Filter by tab
  const filteredAgents = allAgents.filter((agent) => {
    if (activeTab === 'all') return true
    if (activeTab === 'town') return agent.rig === null
    if (activeTab === 'polecats') return agent.type === 'polecat'
    if (activeTab === 'crew') return agent.type === 'crew'
    if (activeTab === 'infrastructure')
      return ['witness', 'refinery'].includes(agent.type)
    return true
  })

  const onlineCount = allAgents.filter((a) => a.online).length
  const polecatCount = allAgents.filter((a) => a.type === 'polecat').length
  const crewCount = allAgents.filter((a) => a.type === 'crew').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Agents
        </CardTitle>
        <CardDescription>
          {allAgents.length} agents total &bull; {onlineCount} online &bull;{' '}
          {polecatCount} polecats &bull; {crewCount} crew
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='mb-4'>
            <TabsTrigger value='all'>All ({allAgents.length})</TabsTrigger>
            <TabsTrigger value='town'>
              Town ({townAgents.length})
            </TabsTrigger>
            <TabsTrigger value='polecats'>
              Polecats ({polecatCount})
            </TabsTrigger>
            <TabsTrigger value='crew'>Crew ({crewCount})</TabsTrigger>
            <TabsTrigger value='infrastructure'>Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-0'>
            <AgentsTable agents={filteredAgents} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
