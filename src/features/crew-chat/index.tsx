import { Link, useNavigate } from '@tanstack/react-router'
import { Users, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TerminalChat } from '@/components/terminal-chat'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

interface CrewChatProps {
  rigId: string
  crewId: string
}

export function CrewChat({ rigId, crewId }: CrewChatProps) {
  const navigate = useNavigate()
  const { status: townStatus, loading: townLoading } = useTownStatus()

  // Find the rig and crew members
  const rig = townStatus?.rigs.find((r) => r.name === rigId)
  const crewMembers = rig?.crew ?? []
  const currentMember = crewMembers.find((m) => m.name === crewId)

  const handleCrewSelect = (name: string) => {
    navigate({
      to: '/rigs/$rigId/crew/$crewId',
      params: { rigId, crewId: name },
    })
  }

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/'>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
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
                <BreadcrumbPage>Crew: {crewId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex h-full gap-4'>
          {/* Sidebar - Crew Members List */}
          <div className='w-64 shrink-0 flex flex-col rounded-lg border bg-card'>
            {/* Sidebar Header - Current Member Info */}
            <div className='border-b p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback>
                    {crewId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 overflow-hidden'>
                  <h2 className='font-semibold truncate'>{crewId}</h2>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Circle
                      className={cn(
                        'h-2 w-2 fill-current',
                        currentMember?.online
                          ? 'text-emerald-500'
                          : 'text-muted-foreground'
                      )}
                    />
                    {currentMember?.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Rig: {rigId}
              </p>
            </div>

            {/* Crew Members List */}
            <div className='border-b px-4 py-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Users className='h-4 w-4' />
                <span>Other Crew Members</span>
              </div>
            </div>
            <ScrollArea className='flex-1'>
              <div className='p-2'>
                {townLoading ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    Loading...
                  </div>
                ) : crewMembers.filter((m) => m.name !== crewId).length === 0 ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    No other crew members
                  </div>
                ) : (
                  crewMembers
                    .filter((m) => m.name !== crewId)
                    .map((member) => (
                      <button
                        key={member.name}
                        onClick={() => handleCrewSelect(member.name)}
                        className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted'
                      >
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback className='text-xs'>
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 overflow-hidden'>
                          <div className='truncate text-sm font-medium'>
                            {member.name}
                          </div>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Circle
                              className={cn(
                                'h-2 w-2 fill-current',
                                member.online
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground'
                              )}
                            />
                            {member.online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Terminal Area */}
          <div className='flex-1 flex flex-col overflow-hidden rounded-lg border bg-card p-4'>
            <TerminalChat
              agentName={crewId}
              agentType='crew'
              rig={rigId}
              title={`${crewId} @ ${rigId}`}
              className='flex-1 flex flex-col min-h-0'
              height='full'
            />
          </div>
        </div>
      </Main>
    </>
  )
}
