import { createFileRoute, Link } from '@tanstack/react-router'
import { GitMerge, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

export const Route = createFileRoute('/_authenticated/rigs/$rigId/merge-queue')({
  component: MergeQueuePage,
})

function MergeQueuePage() {
  const { rigId } = Route.useParams()
  const { status, loading, error } = useTownStatus()

  const rig = status?.rigs.find((r) => r.name === rigId)

  if (loading) {
    return (
      <>
        <Header
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/town'>Town</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/rigs/$rigId' params={{ rigId }}>
                      {rigId}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
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
        <Main>
          <div className='mb-6'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='mt-2 h-4 w-64' />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='mt-2 h-4 w-48' />
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  if (error || !rig) {
    return (
      <>
        <Header
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to='/town'>Town</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{rigId}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
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
        <Main>
          <Card>
            <CardContent className='py-8 text-center text-destructive'>
              {error || `Rig "${rigId}" not found`}
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/town'>Town</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/rigs/$rigId' params={{ rigId }}>
                    {rigId}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
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

      <Main>
        <div className='mb-6'>
          <div className='flex items-center gap-3'>
            <GitMerge className='h-8 w-8' />
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Merge Queue</h1>
              <p className='text-muted-foreground'>
                {rigId} &bull; Processed by Refinery
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-6 grid gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>In Queue</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{rig.refinery.mqCount}</div>
              <p className='text-xs text-muted-foreground'>
                Waiting to be processed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Refinery</CardTitle>
              {rig.refinery.online ? (
                <CheckCircle className='h-4 w-4 text-emerald-500' />
              ) : (
                <XCircle className='h-4 w-4 text-destructive' />
              )}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {rig.refinery.online ? 'Online' : 'Offline'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {rig.refinery.online ? 'Processing merges' : 'Not running'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Status</CardTitle>
              <Loader2 className={`h-4 w-4 ${rig.refinery.online && rig.refinery.mqCount > 0 ? 'animate-spin text-blue-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {rig.refinery.online && rig.refinery.mqCount > 0 ? 'Working' : 'Idle'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {rig.refinery.online && rig.refinery.mqCount > 0
                  ? 'Processing queue'
                  : 'Waiting for work'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Items</CardTitle>
            <CardDescription>
              Merge requests waiting to be processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rig.refinery.mqCount === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <GitMerge className='h-12 w-12 text-muted-foreground/50' />
                <p className='mt-4 text-sm font-medium text-muted-foreground'>
                  Merge queue is empty
                </p>
                <p className='mt-1 text-xs text-muted-foreground/70'>
                  Completed polecat work will appear here for merging
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MR ID</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Placeholder rows - actual data would come from API */}
                  {Array.from({ length: rig.refinery.mqCount }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant='outline'>ga-{Math.random().toString(36).slice(2, 5)}</Badge>
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        polecat/toast-{Math.random().toString(36).slice(2, 10)}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>P2</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className='bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'>
                          <Clock className='mr-1 h-3 w-3' />
                          Queued
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
