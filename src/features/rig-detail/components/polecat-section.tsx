import { Link } from '@tanstack/react-router'
import { Cat, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PolecatSectionProps {
  rigName: string
  polecatCount: number
}

// Mock polecat data - in production this would come from gt polecat list API
interface Polecat {
  id: string
  name: string
  status: 'working' | 'idle' | 'offline'
  currentTask: string | null
  hookBead: string | null
}

const mockPolecats: Polecat[] = [
  {
    id: 'polecat-dementus',
    name: 'dementus',
    status: 'working',
    currentTask: 'Dashboard Redesign: Rig Detail Page',
    hookBead: 'hq-kkl',
  },
]

export function PolecatSection({ rigName, polecatCount }: PolecatSectionProps) {
  // Filter polecats for this rig
  const polecats = mockPolecats

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Cat className='h-5 w-5' />
          Polecats
        </CardTitle>
        <CardDescription>
          AI worker agents in {rigName} ({polecatCount} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {polecats.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No polecats active</p>
        ) : (
          <div className='space-y-3'>
            {polecats.map((polecat) => (
              <div
                key={polecat.id}
                className='rounded-lg border p-3'
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl'>🐱</span>
                    <div>
                      <p className='font-medium'>{polecat.name}</p>
                      <PolecatStatusBadge status={polecat.status} />
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' asChild>
                    <Link
                      to='/agents/$agentId'
                      params={{ agentId: polecat.id }}
                    >
                      <MessageSquare className='h-4 w-4' />
                      <span className='sr-only'>View {polecat.name}</span>
                    </Link>
                  </Button>
                </div>
                {polecat.currentTask && (
                  <div className='mt-2 rounded bg-muted p-2'>
                    <p className='text-xs text-muted-foreground'>Current task:</p>
                    <p className='text-sm font-medium'>{polecat.currentTask}</p>
                    {polecat.hookBead && (
                      <p className='text-xs text-muted-foreground mt-1'>
                        Bead: {polecat.hookBead}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PolecatStatusBadge({ status }: { status: Polecat['status'] }) {
  if (status === 'working') {
    return (
      <Badge className='bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'>
        <span className='inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse' />
        Working
      </Badge>
    )
  }

  if (status === 'idle') {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'>
        <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
        Idle
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
