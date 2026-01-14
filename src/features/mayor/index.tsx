import { useState, useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Circle } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTerminalSocket } from '@/features/agent-detail/hooks/use-terminal-socket'
import { TerminalPanel } from '@/features/agent-detail/components/terminal-panel'
import { ActionButtons } from '@/features/agent-detail/components/action-buttons'

export function Mayor() {
  const [terminalOutput, setTerminalOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleOutput = useCallback((data: string) => {
    setTerminalOutput(data)
    // Clear any error when we get output
    setError(null)
  }, [])

  const handleError = useCallback((message: string) => {
    // Ignore "not running" errors - the UI shows offline state
    if (message.includes('is not running')) {
      return
    }
    setError(message)
  }, [])

  const {
    sessionConnected,
    tmuxSession,
    sendCommand,
    sendInput,
    startSession,
    stopSession,
  } = useTerminalSocket({
    agentName: 'mayor',
    agentType: 'mayor',
    rig: null,
    onOutput: handleOutput,
    onError: handleError,
  })

  // Clear error when session connects
  useEffect(() => {
    if (sessionConnected) {
      setError(null)
    }
  }, [sessionConnected])

  const isOnline = sessionConnected

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
                <BreadcrumbPage>Mayor</BreadcrumbPage>
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

      <Main fixed className='flex flex-col h-[calc(100vh-4rem)] p-2'>
        {/* Compact toolbar */}
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-xl'>🎩</span>
            <span className='font-medium'>Mayor</span>
            <Badge
              className={
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                  : ''
              }
              variant={isOnline ? 'default' : 'outline'}
            >
              <Circle
                className={`mr-1 h-1.5 w-1.5 fill-current ${isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}
              />
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <ActionButtons
            sessionConnected={sessionConnected}
            onStart={startSession}
            onStop={stopSession}
            onSendCommand={sendCommand}
          />
        </div>

        {/* Terminal - fills remaining space */}
        <div className='flex-1 min-h-0'>
          <TerminalPanel
            session={tmuxSession ?? 'mayor'}
            output={terminalOutput}
            error={error}
            onInput={sendInput}
          />
        </div>
      </Main>
    </>
  )
}
