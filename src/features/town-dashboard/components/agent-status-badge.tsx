import { Badge } from '@/components/ui/badge'
import type { AgentStatus } from '../data/schema'

interface AgentStatusBadgeProps {
  status: AgentStatus
}

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  if (status === 'online') {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'>
        <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
        Online
      </Badge>
    )
  }

  return (
    <Badge variant='outline' className='text-muted-foreground'>
      <span className='inline-block h-2 w-2 rounded-full bg-muted-foreground/50' />
      Offline
    </Badge>
  )
}
