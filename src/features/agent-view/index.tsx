import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Circle, Play, Square } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTerminalSocket } from '@/features/agent-detail/hooks/use-terminal-socket'
import { TerminalPanel } from '@/features/agent-detail/components/terminal-panel'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

interface Agent {
  name: string
  online: boolean
  rig: string
  type: 'polecat' | 'crew'
}

export function AgentView() {
  const { status } = useTownStatus()

  // Flatten all agents (polecats + crew) from all rigs
  const agents = useMemo(() => {
    const list: Agent[] = []
    for (const rig of status?.rigs ?? []) {
      for (const polecat of rig.polecats) {
        list.push({
          name: polecat.name,
          online: polecat.online,
          rig: rig.name,
          type: 'polecat',
        })
      }
      for (const member of rig.crew) {
        list.push({
          name: member.name,
          online: member.online,
          rig: rig.name,
          type: 'crew',
        })
      }
    }
    return list
  }, [status])

  // Agent selection
  const [agentIndex, setAgentIndex] = useState(0)
  const selectedAgent = agents[agentIndex] ?? null

  // Reset index if agents change
  useEffect(() => {
    if (agentIndex >= agents.length) {
      setAgentIndex(Math.max(0, agents.length - 1))
    }
  }, [agents.length, agentIndex])

  // Navigation
  const goToPrev = useCallback(() => {
    setAgentIndex((i) => (i > 0 ? i - 1 : agents.length - 1))
  }, [agents.length])

  const goToNext = useCallback(() => {
    setAgentIndex((i) => (i < agents.length - 1 ? i + 1 : 0))
  }, [agents.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrev, goToNext])

  // Agent terminal state
  const [agentOutput, setAgentOutput] = useState('')
  const [agentError, setAgentError] = useState<string | null>(null)

  const handleAgentOutput = useCallback((data: string) => {
    setAgentOutput(data)
    setAgentError(null)
  }, [])

  const handleAgentError = useCallback((message: string) => {
    if (message.includes('is not running')) return
    setAgentError(message)
  }, [])

  const {
    sessionConnected: agentConnected,
    tmuxSession: agentSession,
    sendInput: agentSendInput,
    sendResize: agentSendResize,
    startSession: agentStartSession,
    stopSession: agentStopSession,
  } = useTerminalSocket({
    agentName: selectedAgent?.name ?? '',
    agentType: selectedAgent?.type ?? 'polecat',
    rig: selectedAgent?.rig ?? null,
    onOutput: handleAgentOutput,
    onError: handleAgentError,
  })

  // Clear agent terminal when switching
  useEffect(() => {
    setAgentOutput('')
    setAgentError(null)
  }, [selectedAgent?.name, selectedAgent?.rig])

  // Mayor terminal state
  const [mayorOutput, setMayorOutput] = useState('')
  const [mayorError, setMayorError] = useState<string | null>(null)

  const handleMayorOutput = useCallback((data: string) => {
    setMayorOutput(data)
    setMayorError(null)
  }, [])

  const handleMayorError = useCallback((message: string) => {
    if (message.includes('is not running')) return
    setMayorError(message)
  }, [])

  const {
    sessionConnected: mayorConnected,
    tmuxSession: mayorSession,
    sendInput: mayorSendInput,
    sendResize: mayorSendResize,
    startSession: mayorStartSession,
    stopSession: mayorStopSession,
  } = useTerminalSocket({
    agentName: 'mayor',
    agentType: 'mayor',
    rig: null,
    onOutput: handleMayorOutput,
    onError: handleMayorError,
  })

  return (
    <>
      <Header
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/town'>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Agent View</BreadcrumbPage>
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

      <Main fixed className='flex h-[calc(100vh-4rem)] flex-row gap-2 p-2'>
        {/* Left Panel - Agent Terminal (50%) */}
        <div className='flex w-1/2 flex-col'>
          {/* Agent selector header */}
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {agents.length > 0 ? (
                <>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={goToPrev}
                    disabled={agents.length <= 1}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  <span className='text-xl'>
                    {selectedAgent?.type === 'polecat' ? '😺' : '👷'}
                  </span>
                  <span className='font-medium'>{selectedAgent?.name}</span>
                  <Badge
                    className={
                      agentConnected
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                        : ''
                    }
                    variant={agentConnected ? 'default' : 'outline'}
                  >
                    <Circle
                      className={`mr-1 h-1.5 w-1.5 fill-current ${agentConnected ? 'text-emerald-500' : 'text-muted-foreground'}`}
                    />
                    {agentConnected ? 'Online' : 'Offline'}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    {agentIndex + 1} / {agents.length}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={goToNext}
                    disabled={agents.length <= 1}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </>
              ) : (
                <span className='text-muted-foreground'>No agents</span>
              )}
            </div>
            {/* Start/Stop for crew members only (polecats are managed by witness) */}
            {selectedAgent?.type === 'crew' && (
              <div className='flex gap-1'>
                <Button
                  size='sm'
                  variant={agentConnected ? 'outline' : 'default'}
                  disabled={agentConnected}
                  onClick={agentStartSession}
                >
                  <Play className='mr-1 h-3 w-3' />
                  Start
                </Button>
                <Button
                  size='sm'
                  variant={agentConnected ? 'destructive' : 'outline'}
                  disabled={!agentConnected}
                  onClick={agentStopSession}
                >
                  <Square className='mr-1 h-3 w-3' />
                  Stop
                </Button>
              </div>
            )}
          </div>

          {/* Agent Terminal */}
          <div className='min-h-0 flex-1'>
            {selectedAgent ? (
              <TerminalPanel
                session={agentSession ?? selectedAgent.name}
                output={agentOutput}
                error={agentError}
                onInput={agentSendInput}
                onResize={agentSendResize}
              />
            ) : (
              <div className='flex h-full items-center justify-center rounded-md bg-zinc-950 text-muted-foreground'>
                No agents available
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Mayor Terminal (50%) */}
        <div className='flex w-1/2 flex-col'>
          {/* Mayor header */}
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>🎩</span>
              <span className='font-medium'>Mayor</span>
              <Badge
                className={
                  mayorConnected
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                    : ''
                }
                variant={mayorConnected ? 'default' : 'outline'}
              >
                <Circle
                  className={`mr-1 h-1.5 w-1.5 fill-current ${mayorConnected ? 'text-emerald-500' : 'text-muted-foreground'}`}
                />
                {mayorConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className='flex gap-1'>
              <Button
                size='sm'
                variant={mayorConnected ? 'outline' : 'default'}
                disabled={mayorConnected}
                onClick={mayorStartSession}
              >
                <Play className='mr-1 h-3 w-3' />
                Start
              </Button>
              <Button
                size='sm'
                variant={mayorConnected ? 'destructive' : 'outline'}
                disabled={!mayorConnected}
                onClick={mayorStopSession}
              >
                <Square className='mr-1 h-3 w-3' />
                Stop
              </Button>
            </div>
          </div>

          {/* Mayor Terminal */}
          <div className='min-h-0 flex-1'>
            <TerminalPanel
              session={mayorSession ?? 'mayor'}
              output={mayorOutput}
              error={mayorError}
              onInput={mayorSendInput}
              onResize={mayorSendResize}
            />
          </div>
        </div>
      </Main>
    </>
  )
}
