import { Building2, GitMerge, LayoutDashboard, Server, Truck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTownStatus } from './hooks/use-town-status'
import { WorkQueueTab } from './components/work-queue-tab'

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

export function TownDashboard() {
  const { status, loading, error } = useTownStatus()

  if (loading) {
    return (
      <>
        <Header
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
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
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-32' />
            ))}
          </div>
        </Main>
      </>
    )
  }

  if (error || !status) {
    return (
      <>
        <Header
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
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
              {error || 'Failed to load town status'}
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const totalPolecats = status.rigs.reduce((acc, r) => acc + r.polecats.length, 0)
  const onlinePolecats = status.rigs.reduce(
    (acc, r) => acc + r.polecats.filter((p) => p.online).length,
    0
  )
  const totalCrew = status.rigs.reduce((acc, r) => acc + r.crew.length, 0)
  const activeConvoys = status.convoys.filter((c) => c.status === 'active')

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
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
          <h1 className='text-2xl font-bold tracking-tight'>
            Gas Town Overview
          </h1>
          <p className='text-muted-foreground'>
            {status.town.name} &bull; {status.town.path}
          </p>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>
              <LayoutDashboard className='mr-2 h-4 w-4' />
              Overview
            </TabsTrigger>
            <TabsTrigger value='work-queue'>
              <GitMerge className='mr-2 h-4 w-4' />
              Work Queue
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            {/* Summary Cards */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Town</CardTitle>
              <Building2 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{status.town.name}</div>
              <p className='text-xs text-muted-foreground'>
                Overseer: {status.overseer.name.split(' ')[0]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rigs</CardTitle>
              <Server className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{status.rigs.length}</div>
              <p className='text-xs text-muted-foreground'>
                {totalPolecats} polecats, {totalCrew} crew
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Polecats</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalPolecats}</div>
              <p className='text-xs text-muted-foreground'>
                {onlinePolecats} online, {totalPolecats - onlinePolecats} offline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Convoys</CardTitle>
              <Truck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{activeConvoys.length}</div>
              <p className='text-xs text-muted-foreground'>
                {status.convoys.length} total
              </p>
            </CardContent>
          </Card>
        </div>

            {/* Town Agents Section */}
            <div>
          <Card>
            <CardHeader>
              <CardTitle>Town Agents</CardTitle>
              <CardDescription>Mayor, Deacon, and system-level agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {status.townAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className='flex items-center gap-3 rounded-lg border p-3'
                  >
                    <span className='text-2xl'>{agent.icon}</span>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium capitalize'>{agent.name}</span>
                        <StatusIndicator online={agent.online} />
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {agent.online ? 'Online' : 'Offline'}
                        {agent.mailCount > 0 && ` • 📬 ${agent.mailCount}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Active Convoys with Progress */}
            <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Convoys</CardTitle>
              <CardDescription>Batch work coordination with progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeConvoys.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <Truck className='h-12 w-12 text-muted-foreground/50' />
                  <p className='mt-4 text-sm font-medium text-muted-foreground'>
                    No active convoys
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground/70'>
                    Convoys will appear here when created
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {activeConvoys.map((convoy) => {
                    const progress = convoy.total > 0
                      ? Math.round((convoy.completed / convoy.total) * 100)
                      : 0
                    return (
                      <div key={convoy.id} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{convoy.name}</span>
                            <Badge variant='outline' className='text-xs'>
                              {convoy.id}
                            </Badge>
                          </div>
                          <span className='text-sm text-muted-foreground'>
                            {convoy.completed}/{convoy.total} issues
                          </span>
                        </div>
                        <Progress value={progress} className='h-2' />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

            {/* Rigs Section */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {status.rigs.map((rig) => (
            <Card key={rig.name}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Server className='h-5 w-5' />
                  {rig.name}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Witness & Refinery */}
                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex items-center gap-2 rounded-md border p-2'>
                    <span>🦉</span>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm'>Witness</span>
                        <StatusIndicator online={rig.witness.online} />
                      </div>
                      {rig.witness.mailCount > 0 && (
                        <p className='text-xs text-muted-foreground'>
                          📬 {rig.witness.mailCount}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-2 rounded-md border p-2'>
                    <span>🏭</span>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm'>Refinery</span>
                        <StatusIndicator online={rig.refinery.online} />
                      </div>
                      {rig.refinery.mqCount > 0 && (
                        <p className='text-xs text-muted-foreground'>
                          MQ: {rig.refinery.mqCount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Crew */}
                <div>
                  <p className='mb-2 text-sm font-medium'>
                    👷 Crew ({rig.crew.length})
                  </p>
                  {rig.crew.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>No crew members</p>
                  ) : (
                    <div className='flex flex-wrap gap-1'>
                      {rig.crew.map((member) => (
                        <Badge
                          key={member.name}
                          variant={member.online ? 'default' : 'secondary'}
                          className='text-xs'
                        >
                          {member.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Polecats */}
                <div>
                  <p className='mb-2 text-sm font-medium'>
                    😺 Polecats ({rig.polecats.length})
                  </p>
                  {rig.polecats.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>No polecats</p>
                  ) : (
                    <div className='flex flex-wrap gap-1'>
                      {rig.polecats.map((polecat) => (
                        <Badge
                          key={polecat.name}
                          variant={polecat.online ? 'default' : 'secondary'}
                          className='text-xs'
                        >
                          {polecat.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>

          <TabsContent value='work-queue'>
            <WorkQueueTab />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
