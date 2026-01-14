import { Link } from '@tanstack/react-router'
import { MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AgentStatusBadge } from '@/features/town-dashboard/components/agent-status-badge'
import type { CrewMember } from '@/features/town-dashboard/data/schema'

interface CrewSectionProps {
  crew: CrewMember[]
  rigName: string
}

export function CrewSection({ crew, rigName }: CrewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Users className='h-5 w-5' />
          Crew Agents
        </CardTitle>
        <CardDescription>Human-managed workspaces in {rigName}</CardDescription>
      </CardHeader>
      <CardContent>
        {crew.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No crew members</p>
        ) : (
          <div className='space-y-3'>
            {crew.map((member) => (
              <div
                key={member.id}
                className='flex items-center justify-between gap-4 rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-2xl'>👷</span>
                  <div>
                    <p className='font-medium'>{member.name}</p>
                    <p className='text-xs text-muted-foreground'>Crew workspace</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <AgentStatusBadge status={member.status} />
                  <Button variant='ghost' size='sm' asChild>
                    <Link
                      to='/agents/$agentId'
                      params={{ agentId: member.id }}
                    >
                      <MessageSquare className='h-4 w-4' />
                      <span className='sr-only'>Chat with {member.name}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
