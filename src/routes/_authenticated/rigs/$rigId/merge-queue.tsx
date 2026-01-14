import { createFileRoute, Link } from '@tanstack/react-router'
import { GitMerge } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

export const Route = createFileRoute('/_authenticated/rigs/$rigId/merge-queue')({
  component: RigMergeQueuePage,
})

function RigMergeQueuePage() {
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
            <Skeleton className='mt-2 h-4 w-32' />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='mt-1 h-4 w-48' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-24 w-full' />
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
          <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
            <GitMerge className='h-6 w-6' />
            Merge Queue
          </h1>
          <p className='text-muted-foreground'>
            {rig.name} &bull; Pending merge requests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GitMerge className='h-5 w-5' />
              Merge Queue
            </CardTitle>
            <CardDescription>
              Pending merge requests processed by the Refinery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rig.refinery.mqCount === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <GitMerge className='h-12 w-12 text-muted-foreground/50' />
                <p className='mt-4 text-sm font-medium text-muted-foreground'>
                  Merge queue is empty
                </p>
                <p className='mt-1 text-xs text-muted-foreground/70'>
                  Completed work will appear here for merging
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='rounded-lg border p-4 text-center'>
                  <p className='text-2xl font-bold'>{rig.refinery.mqCount}</p>
                  <p className='text-sm text-muted-foreground'>items in queue</p>
                </div>
                <p className='text-xs text-muted-foreground'>
                  The Refinery processes merge requests automatically when online.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
