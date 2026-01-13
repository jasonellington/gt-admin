import { Truck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Convoy } from '../data/schema'

interface ConvoyListProps {
  convoys: Convoy[]
}

export function ConvoyList({ convoys }: ConvoyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Convoys</CardTitle>
        <CardDescription>Batch work coordination</CardDescription>
      </CardHeader>
      <CardContent>
        {convoys.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Truck className='h-12 w-12 text-muted-foreground/50' />
            <p className='mt-4 text-sm font-medium text-muted-foreground'>
              No convoys configured
            </p>
            <p className='mt-1 text-xs text-muted-foreground/70'>
              Convoys will appear here when created
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {convoys.map((convoy) => (
              <div
                key={convoy.id}
                className='flex items-center justify-between rounded-md border p-3'
              >
                <div>
                  <p className='text-sm font-medium'>{convoy.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {convoy.issues.length} issues
                  </p>
                </div>
                <span className='text-xs text-muted-foreground'>
                  {convoy.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
