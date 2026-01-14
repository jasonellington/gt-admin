import { useState, useMemo } from 'react'
import { GitMerge, Check, X, Eye, RefreshCw, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useMergeQueue, type MergeQueueItem } from '../hooks/use-merge-queue'

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'blocked'

function StatusBadge({ status }: { status: MergeQueueItem['status'] }) {
  const variants: Record<MergeQueueItem['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    in_progress: { variant: 'default', label: 'In Progress' },
    blocked: { variant: 'destructive', label: 'Blocked' },
    merged: { variant: 'outline', label: 'Merged' },
    failed: { variant: 'destructive', label: 'Failed' },
  }

  const { variant, label } = variants[status] || { variant: 'secondary', label: status }

  return <Badge variant={variant}>{label}</Badge>
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function WorkQueueTab() {
  const { items, loading, error, refetch } = useMergeQueue()
  const [rigFilter, setRigFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [readyOnly, setReadyOnly] = useState(false)

  // Get unique rigs for filter dropdown
  const rigs = useMemo(() => {
    const rigSet = new Set(items.map((item) => item.rig))
    return Array.from(rigSet).sort()
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (rigFilter !== 'all' && item.rig !== rigFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (readyOnly && item.status === 'blocked') return false
      return true
    })
  }, [items, rigFilter, statusFilter, readyOnly])

  // Action handlers
  const handleViewDiff = (_item: MergeQueueItem) => {
    // TODO: Open diff viewer or navigate to diff page
  }

  const handleApprove = async (_item: MergeQueueItem) => {
    // TODO: Call API to approve MR
  }

  const handleReject = async (_item: MergeQueueItem) => {
    // TODO: Call API to reject MR
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-destructive'>
          {error}
          <Button variant='outline' size='sm' className='ml-4' onClick={refetch}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <GitMerge className='h-5 w-5' />
              Work Queue
            </CardTitle>
            <CardDescription>Merge requests pending review across all rigs</CardDescription>
          </div>
          <Button variant='outline' size='sm' onClick={refetch}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>Filters:</span>
          </div>

          <Select value={rigFilter} onValueChange={setRigFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Rigs' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Rigs</SelectItem>
              {rigs.map((rig) => (
                <SelectItem key={rig} value={rig}>
                  {rig}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='blocked'>Blocked</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={readyOnly ? 'default' : 'outline'}
            size='sm'
            onClick={() => setReadyOnly(!readyOnly)}
          >
            Ready Only
          </Button>

          <span className='ml-auto text-sm text-muted-foreground'>
            {filteredItems.length} of {items.length} items
          </span>
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <GitMerge className='h-12 w-12 text-muted-foreground/50' />
            <p className='mt-4 text-sm font-medium text-muted-foreground'>
              {items.length === 0 ? 'No merge requests in queue' : 'No items match filters'}
            </p>
            <p className='mt-1 text-xs text-muted-foreground/70'>
              {items.length === 0
                ? 'Merge requests will appear here when submitted'
                : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Rig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={`${item.rig}-${item.id}`}>
                    <TableCell className='font-mono text-sm'>
                      {item.id}
                      {item.title && (
                        <p className='text-xs text-muted-foreground'>{item.title}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 font-mono text-xs'>
                        <span className='max-w-[120px] truncate' title={item.source}>
                          {item.source}
                        </span>
                        <span className='text-muted-foreground'>→</span>
                        <span className='max-w-[80px] truncate' title={item.target}>
                          {item.target}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{item.rig}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatRelativeTime(item.createdAt)}
                      {item.createdBy && (
                        <p className='text-xs'>by {item.createdBy}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleViewDiff(item)}
                          title='View diff'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className={cn(
                            'h-8 w-8',
                            'hover:bg-green-500/10 hover:text-green-500'
                          )}
                          onClick={() => handleApprove(item)}
                          title='Approve'
                          disabled={item.status === 'blocked'}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className={cn(
                            'h-8 w-8',
                            'hover:bg-destructive/10 hover:text-destructive'
                          )}
                          onClick={() => handleReject(item)}
                          title='Reject'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
