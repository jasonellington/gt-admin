import { Link } from '@tanstack/react-router'
import { Circle, Eye, Factory, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Agent } from '@/features/town-dashboard/data/schema'

interface RigAgentCardsProps {
  witness: Agent | undefined
  refinery: Agent | undefined
  rigName: string
}

export function RigAgentCards({ witness, refinery, rigName }: RigAgentCardsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <AgentStatusCard
        agent={witness}
        icon={<Eye className='h-5 w-5' />}
        emoji='🦉'
        title='Witness'
        description='Monitors polecat health and progress'
        rigName={rigName}
      />
      <AgentStatusCard
        agent={refinery}
        icon={<Factory className='h-5 w-5' />}
        emoji='🏭'
        title='Refinery'
        description='Processes merge queue'
        rigName={rigName}
      />
    </div>
  )
}

interface AgentStatusCardProps {
  agent: Agent | undefined
  icon: React.ReactNode
  emoji: string
  title: string
  description: string
  rigName: string
}

function AgentStatusCard({
  agent,
  icon,
  emoji,
  title,
  description,
}: AgentStatusCardProps) {
  const isOnline = agent?.status === 'online'

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            {icon}
            {title}
          </CardTitle>
          <Badge
            className={
              isOnline
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                : ''
            }
            variant={isOnline ? 'default' : 'outline'}
          >
            <Circle
              className={`mr-1 h-2 w-2 fill-current ${isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-2xl'>{emoji}</span>
            <div className='text-sm'>
              <p className='font-medium'>{agent?.name ?? title.toLowerCase()}</p>
              <p className='text-muted-foreground'>
                {isOnline ? 'Running' : 'Stopped'}
              </p>
            </div>
          </div>
          {agent && (
            <Button variant='ghost' size='sm' asChild>
              <Link to='/agents/$agentId' params={{ agentId: agent.id }}>
                <MessageSquare className='h-4 w-4' />
                <span className='sr-only'>View {title}</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
