import { Link } from '@tanstack/react-router'
import { Truck, CheckCircle, Circle, Clock, User, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useConvoyDetail } from '../hooks/use-convoys'

interface ConvoyDetailDialogProps {
  convoyId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  open: { icon: Circle, color: 'text-blue-500', bg: 'bg-blue-500' },
  in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
  closed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
} as const

export function ConvoyDetailDialog({
  convoyId,
  open,
  onOpenChange,
}: ConvoyDetailDialogProps) {
  const { convoy, loading } = useConvoyDetail(open ? convoyId : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {convoy?.name || 'Loading...'}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {convoyId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading convoy details...
          </div>
        ) : convoy ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={convoy.status === 'completed' ? 'default' : 'secondary'}>
                {convoy.status}
              </Badge>
            </div>

            <Separator />

            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{convoy.completed}/{convoy.total} completed</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${convoy.total > 0 ? (convoy.completed / convoy.total) * 100 : 0}%` }}
              />
            </div>

            <Separator />

            {/* Issues */}
            <div>
              <h4 className="mb-2 text-sm font-medium">
                Issues ({convoy.issues?.length || 0})
              </h4>
              {convoy.issues && convoy.issues.length > 0 ? (
                <div className="space-y-2">
                  {convoy.issues.map((issue) => {
                    const status = issue.status as keyof typeof statusConfig
                    const config = statusConfig[status] || statusConfig.open
                    const Icon = config.icon
                    // Parse assignee to get polecat name for linking
                    const polecatMatch = issue.assignee?.match(/polecats\/(\w+)$/)
                    const polecatName = polecatMatch?.[1]

                    return (
                      <div
                        key={issue.id}
                        className="rounded-md border p-2 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                          <span className="text-sm flex-1">{issue.title || issue.id}</span>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">
                            {issue.id}
                          </span>
                        </div>
                        {polecatName && (
                          <div className="flex items-center justify-end">
                            <Link
                              to="/agents/$agentId"
                              params={{ agentId: `polecat-${polecatName}` }}
                              search={{ from: 'convoy', convoyId: convoyId || undefined }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="outline" size="sm" className="h-7 px-2">
                                <User className="h-3 w-3 mr-1" />
                                {polecatName}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No issues tracked</p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Convoy not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
