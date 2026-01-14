import { Link } from '@tanstack/react-router'
import { Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Convoy } from '@/features/town-dashboard/data/schema'

interface RigConvoySectionProps {
  convoys: Convoy[]
  rigName: string
}

export function RigConvoySection({ convoys, rigName }: RigConvoySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Truck className='h-5 w-5' />
          Convoys
        </CardTitle>
        <CardDescription>Work batches in {rigName}</CardDescription>
      </CardHeader>
      <CardContent>
        {convoys.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Truck className='h-12 w-12 text-muted-foreground/50' />
            <p className='mt-2 text-sm text-muted-foreground'>
              No active convoys
            </p>
            <Link
              to='/convoys'
              className='mt-4 text-sm text-primary hover:underline'
            >
              View all convoys
            </Link>
          </div>
        ) : (
          <div className='space-y-3'>
            {convoys.map((convoy) => (
              <div
                key={convoy.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <Truck className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>{convoy.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {convoy.issues.length} issues
                    </p>
                  </div>
                </div>
                <ConvoyStatusBadge status={convoy.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ConvoyStatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase()

  if (statusLower === 'active' || statusLower === 'in_progress') {
    return (
      <Badge className='bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'>
        Active
      </Badge>
    )
  }

  if (statusLower === 'completed' || statusLower === 'done') {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'>
        Completed
      </Badge>
    )
  }

  if (statusLower === 'pending') {
    return (
      <Badge variant='outline' className='text-muted-foreground'>
        Pending
      </Badge>
    )
  }

  return <Badge variant='outline'>{status}</Badge>
}
