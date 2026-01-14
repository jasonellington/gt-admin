import { createFileRoute, Link } from '@tanstack/react-router'
import { Server, Users, Eye, Factory } from 'lucide-react'
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
              <p className='text-muted-foreground'>Rig Overview</p>
            </div>
          </div>
        </div>

        {/* Rig Agents */}
        <div className='mb-6 grid gap-4 md:grid-cols-2'>
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
        <Card className='mb-6'>
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

        {/* Polecats */}
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
      </Main>
    </>
  )
}
