import { Truck, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Convoy } from '../hooks/use-convoys'

interface ConvoyCardProps {
  convoy: Convoy
  onClick: () => void
}

export function ConvoyCard({ convoy, onClick }: ConvoyCardProps) {
  const progress = convoy.issueCount > 0
    ? Math.round((convoy.completedCount / convoy.issueCount) * 100)
    : 0
  const isCompleted = convoy.status === 'completed'

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Truck className="h-4 w-4" />
          {convoy.name}
        </CardTitle>
        <Badge variant={isCompleted ? 'default' : 'secondary'}>
          {isCompleted ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </>
          ) : (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Active
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {convoy.completedCount}/{convoy.issueCount} issues
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              {convoy.completedCount} done
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
              {convoy.issueCount - convoy.completedCount} remaining
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground font-mono">{convoy.id}</p>
      </CardContent>
    </Card>
  )
}
