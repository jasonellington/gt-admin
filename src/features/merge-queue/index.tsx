import { useState, useMemo } from 'react'
import {
  GitMerge,
  Eye,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Filter,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useMergeQueue,
  type MergeQueueItem,
} from '@/features/town-dashboard/hooks/use-merge-queue'

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'blocked'

function StatusBadge({ status }: { status: MergeQueueItem['status'] }) {
  const variants: Record<
    MergeQueueItem['status'],
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    pending: { variant: 'secondary', label: 'Pending' },
    in_progress: { variant: 'default', label: 'In Progress' },
    blocked: { variant: 'destructive', label: 'Blocked' },
    merged: { variant: 'outline', label: 'Merged' },
    failed: { variant: 'destructive', label: 'Failed' },
  }

  const { variant, label } = variants[status] || {
    variant: 'secondary',
    label: status,
  }

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

export function MergeQueue() {
  const { items, loading, error, refetch } = useMergeQueue()
  const [rigFilter, setRigFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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
      return true
    })
  }, [items, rigFilter, statusFilter])

  // Action handlers
  const handleViewDiff = (item: MergeQueueItem) => {
    // Open diff in new tab (placeholder - would be actual diff URL)
    console.log('View diff for:', item.id)
  }

  const handleCheckout = async (item: MergeQueueItem) => {
    // Trigger checkout command
    console.log('Checkout branch:', item.source)
  }

  const handleMerge = async (item: MergeQueueItem) => {
    // Trigger merge action
    console.log('Merge:', item.id)
  }

  const handleOpenPR = (item: MergeQueueItem) => {
    // Open PR/MR in browser (placeholder - would be actual PR URL)
    console.log('Open PR for:', item.id)
  }

  const headerContent = (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Merge Queue</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
    </>
  )

  if (loading) {
    return (
      <>
        {headerContent}
        <Main>
          <div className='mb-6'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='mt-2 h-4 w-64' />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        {headerContent}
        <Main>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight'>Merge Queue</h1>
            <p className='text-muted-foreground'>
              Review and manage merge requests
            </p>
          </div>
          <Card>
            <CardContent className='py-8 text-center text-destructive'>
              {error}
              <Button
                variant='outline'
                size='sm'
                className='ml-4'
                onClick={refetch}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  return (
    <>
      {headerContent}
      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Merge Queue</h1>
          <p className='text-muted-foreground'>
            Review and manage merge requests across all rigs
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <GitMerge className='h-5 w-5' />
                  Pending Reviews
                </CardTitle>
                <CardDescription>
                  {filteredItems.length} merge request
                  {filteredItems.length !== 1 ? 's' : ''} awaiting review
                </CardDescription>
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

              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
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

              <span className='ml-auto text-sm text-muted-foreground'>
                {filteredItems.length} of {items.length} items
              </span>
            </div>

            {/* Table */}
            {filteredItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <GitMerge className='h-12 w-12 text-muted-foreground/50' />
                <p className='mt-4 text-sm font-medium text-muted-foreground'>
                  {items.length === 0
                    ? 'No merge requests in queue'
                    : 'No items match filters'}
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
                            <p className='text-xs text-muted-foreground'>
                              {item.title}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 font-mono text-xs'>
                            <span
                              className='max-w-[120px] truncate'
                              title={item.source}
                            >
                              {item.source}
                            </span>
                            <span className='text-muted-foreground'>→</span>
                            <span
                              className='max-w-[80px] truncate'
                              title={item.target}
                            >
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
                              className='h-8 w-8'
                              onClick={() => handleCheckout(item)}
                              title='Checkout branch'
                            >
                              <GitBranch className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className={cn(
                                'h-8 w-8',
                                'hover:bg-green-500/10 hover:text-green-500'
                              )}
                              onClick={() => handleMerge(item)}
                              title='Merge'
                              disabled={item.status === 'blocked'}
                            >
                              <GitMerge className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => handleOpenPR(item)}
                              title='Open PR'
                            >
                              <ExternalLink className='h-4 w-4' />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                >
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => handleViewDiff(item)}
                                >
                                  <Eye className='mr-2 h-4 w-4' />
                                  View Diff
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCheckout(item)}
                                >
                                  <GitBranch className='mr-2 h-4 w-4' />
                                  Checkout
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleMerge(item)}
                                  disabled={item.status === 'blocked'}
                                  className='text-green-600'
                                >
                                  <GitMerge className='mr-2 h-4 w-4' />
                                  Merge
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenPR(item)}
                                >
                                  <ExternalLink className='mr-2 h-4 w-4' />
                                  Open PR
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </Main>
    </>
  )
}
