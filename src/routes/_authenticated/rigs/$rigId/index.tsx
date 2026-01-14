import { createFileRoute, Link } from '@tanstack/react-router'
import { Server, Users, Eye, Factory, GitMerge, LayoutDashboard, Cat } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

export const Route = createFileRoute('/_authenticated/rigs/$rigId/')({
  component: RigOverviewPage,
})

function StatusIndicator({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        online ? 'bg-green-500' : 'bg-muted-foreground/30'
      )}
    />
  )
}

function RigOverviewPage() {
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
                  <BreadcrumbPage>{rigId}</BreadcrumbPage>
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
          <Skeleton className='h-8 w-48' />
          <Skeleton className='mt-4 h-32' />
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
                <BreadcrumbPage>{rigId}</BreadcrumbPage>
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
            <Server className='h-8 w-8' />
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>{rig.name}</h1>
              <p className='text-muted-foreground'>Rig Dashboard</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>
              <LayoutDashboard className='h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='polecats'>
              <Cat className='h-4 w-4' />
              Polecats ({rig.polecats.length})
            </TabsTrigger>
            <TabsTrigger value='merge-queue'>
              <GitMerge className='h-4 w-4' />
              Merge Queue {rig.refinery.mqCount > 0 && `(${rig.refinery.mqCount})`}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            {/* Rig Agents */}
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-base'>Witness</CardTitle>
                  <Eye className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-2'>
                    <StatusIndicator online={rig.witness.online} />
                    <span>{rig.witness.online ? 'Online' : 'Offline'}</span>
                  </div>
                  {rig.witness.mailCount > 0 && (
                    <p className='mt-2 text-sm text-muted-foreground'>
                      {rig.witness.mailCount} messages
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-base'>Refinery</CardTitle>
                  <Factory className='h-5 w-5 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-2'>
                    <StatusIndicator online={rig.refinery.online} />
                    <span>{rig.refinery.online ? 'Online' : 'Offline'}</span>
                  </div>
                  {rig.refinery.mqCount > 0 && (
                    <p className='mt-2 text-sm text-muted-foreground'>
                      {rig.refinery.mqCount} in queue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Crew Members */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Crew Members
                </CardTitle>
                <CardDescription>
                  Human-managed workers on this rig
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rig.crew.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No crew members</p>
                ) : (
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                    {rig.crew.map((member) => (
                      <Link
                        key={member.name}
                        to='/rigs/$rigId/crew/$crewId'
                        params={{ rigId, crewId: member.name }}
                        className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted'
                      >
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className='font-medium'>{member.name}</div>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <StatusIndicator online={member.online} />
                            {member.online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Polecats View */}
            <Card>
              <CardHeader>
                <CardTitle>Polecats</CardTitle>
                <CardDescription>
                  Witness-managed transient workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rig.polecats.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No polecats</p>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {rig.polecats.map((polecat) => (
                      <Badge
                        key={polecat.name}
                        variant={polecat.online ? 'default' : 'secondary'}
                      >
                        <StatusIndicator online={polecat.online} />
                        <span className='ml-1'>{polecat.name}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Polecats Tab */}
          <TabsContent value='polecats' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Cat className='h-5 w-5' />
                  Active Polecats
                </CardTitle>
                <CardDescription>
                  AI workers managed by the Witness
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rig.polecats.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <Cat className='h-12 w-12 text-muted-foreground/50' />
                    <p className='mt-4 text-sm font-medium text-muted-foreground'>
                      No polecats active
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground/70'>
                      Polecats are spawned by the Witness when work is available
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                    {rig.polecats.map((polecat) => (
                      <div
                        key={polecat.name}
                        className='flex items-center gap-3 rounded-lg border p-3'
                      >
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg'>
                          🐱
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>{polecat.name}</div>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <StatusIndicator online={polecat.online} />
                            {polecat.online ? 'Working' : 'Idle'}
                          </div>
                        </div>
                        <Badge variant={polecat.online ? 'default' : 'outline'}>
                          {polecat.online ? 'Active' : 'Stopped'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Merge Queue Tab */}
          <TabsContent value='merge-queue' className='space-y-4'>
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
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
