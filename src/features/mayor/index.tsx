import { useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Send,
  Crown,
  Building2,
  Circle,
  Users,
  HardHat,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTerminalSocket } from '@/features/agent-detail/hooks/use-terminal-socket'
import { TerminalPanel } from '@/features/agent-detail/components/terminal-panel'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

export function Mayor() {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [terminalOutput, setTerminalOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const commandHistoryRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)

  const { status: townStatus, loading: townLoading } = useTownStatus()

  const handleOutput = useCallback((data: string) => {
    setTerminalOutput(data)
  }, [])

  const handleError = useCallback((message: string) => {
    setError(message)
  }, [])

  const {
    status,
    sessionConnected,
    tmuxSession,
    sendCommand,
    reconnect,
  } = useTerminalSocket({
    agentName: 'mayor',
    agentType: 'mayor',
    rig: null,
    onOutput: handleOutput,
    onError: handleError,
  })

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionConnected) return

    // Add to command history
    commandHistoryRef.current.unshift(inputValue.trim())
    historyIndexRef.current = -1

    // Send the command to Mayor's tmux session
    sendCommand(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
        historyIndexRef.current++
        setInputValue(commandHistoryRef.current[historyIndexRef.current])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--
        setInputValue(commandHistoryRef.current[historyIndexRef.current])
      } else if (historyIndexRef.current === 0) {
        historyIndexRef.current = -1
        setInputValue('')
      }
    }
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
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
                <BreadcrumbPage>Mayor</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex h-full gap-4'>
          {/* Sidebar - Rigs and Agents */}
          <div className='w-64 shrink-0 rounded-lg border bg-card'>
            <div className='border-b p-4'>
              <div className='flex items-center gap-2'>
                <Building2 className='h-5 w-5' />
                <h2 className='font-semibold'>Town Overview</h2>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {townStatus?.town?.name ?? 'Loading...'}
              </p>
            </div>
            <ScrollArea className='h-[calc(100%-73px)]'>
              <div className='p-2'>
                {townLoading ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    Loading...
                  </div>
                ) : !townStatus?.rigs?.length ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    No rigs found
                  </div>
                ) : (
                  <>
                    {/* Rigs Section */}
                    {townStatus.rigs.map((rig) => (
                      <div key={rig.name} className='mb-4'>
                        <button
                          onClick={() =>
                            navigate({
                              to: '/rigs/$rigId',
                              params: { rigId: rig.name },
                            })
                          }
                          className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted'
                        >
                          <HardHat className='h-4 w-4 text-muted-foreground' />
                          <span>{rig.name}</span>
                          <Badge variant='outline' className='ml-auto text-xs'>
                            {rig.polecats.length}
                          </Badge>
                        </button>

                        {/* Polecats in this rig */}
                        {rig.polecats.length > 0 && (
                          <div className='ml-4 mt-1 space-y-1'>
                            {rig.polecats.map((polecat) => (
                              <button
                                key={polecat.name}
                                onClick={() =>
                                  navigate({
                                    to: '/agents/$agentId',
                                    params: { agentId: polecat.name },
                                  })
                                }
                                className='flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted'
                              >
                                <Circle
                                  className={cn(
                                    'h-2 w-2 fill-current',
                                    polecat.online
                                      ? 'text-emerald-500'
                                      : 'text-muted-foreground'
                                  )}
                                />
                                <span className='truncate'>{polecat.name}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Crew in this rig */}
                        {rig.crew.length > 0 && (
                          <div className='ml-4 mt-1 space-y-1'>
                            <div className='flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground'>
                              <Users className='h-3 w-3' />
                              <span>Crew</span>
                            </div>
                            {rig.crew.map((member) => (
                              <button
                                key={member.name}
                                onClick={() =>
                                  navigate({
                                    to: '/rigs/$rigId/crew/$crewId',
                                    params: { rigId: rig.name, crewId: member.name },
                                  })
                                }
                                className='flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted'
                              >
                                <Circle
                                  className={cn(
                                    'h-2 w-2 fill-current',
                                    member.online
                                      ? 'text-emerald-500'
                                      : 'text-muted-foreground'
                                  )}
                                />
                                <span className='truncate'>{member.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Convoys Section */}
                    {townStatus.convoys && townStatus.convoys.length > 0 && (
                      <div className='mt-4 border-t pt-4'>
                        <div className='flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground'>
                          <Truck className='h-3 w-3' />
                          <span>Active Convoys</span>
                        </div>
                        {townStatus.convoys
                          .filter((c) => c.status === 'active')
                          .map((convoy) => (
                            <button
                              key={convoy.id}
                              onClick={() => navigate({ to: '/convoys' })}
                              className='flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted'
                            >
                              <span className='truncate'>{convoy.name}</span>
                              <Badge variant='secondary' className='ml-auto text-xs'>
                                {convoy.completed}/{convoy.total}
                              </Badge>
                            </button>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Terminal Area */}
          <div className='flex flex-1 flex-col gap-4 overflow-hidden'>
            {/* Header */}
            <div className='flex items-center gap-3 rounded-lg border bg-card px-4 py-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src='/avatars/mayor.jpg' alt='Mayor' />
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  <Crown className='size-5' />
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <h1 className='text-lg font-semibold'>Mayor</h1>
                <div className='text-sm text-muted-foreground'>
                  {tmuxSession ? (
                    <span className='font-mono text-xs'>{tmuxSession}</span>
                  ) : (
                    'Task coordination assistant'
                  )}
                </div>
              </div>
            </div>

            {/* Terminal Panel */}
            <div className='flex-1 min-h-0'>
              <TerminalPanel
                session={tmuxSession ?? 'mayor'}
                output={terminalOutput}
                status={status}
                sessionConnected={sessionConnected}
                error={error}
                onReconnect={reconnect}
              />
            </div>

            {/* Command Input */}
            <form onSubmit={handleSendCommand} className='flex gap-2 rounded-lg border bg-card p-4'>
              <label className='flex-1'>
                <span className='sr-only'>Send command to Mayor</span>
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    sessionConnected
                      ? 'Type a command... (↑↓ for history)'
                      : 'Connect to Mayor to send commands...'
                  }
                  disabled={!sessionConnected}
                  className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </label>
              <Button
                type='submit'
                size='icon'
                disabled={!sessionConnected || !inputValue.trim()}
              >
                <Send className='size-4' />
                <span className='sr-only'>Send command</span>
              </Button>
            </form>
          </div>
        </div>
      </Main>
    </>
  )
}
