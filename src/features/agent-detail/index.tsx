import { useCallback, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TerminalPanel } from './components/terminal-panel'
import { ActionButtons } from './components/action-buttons'
import { useTerminalSocket, type AgentType } from './hooks/use-terminal-socket'
import { mockAgents, mockCrew } from '@/features/town-dashboard/data/mock-data'
import type { AgentStatus } from '@/features/town-dashboard/data/schema'

interface AgentDetailProps {
  agentId: string
  from?: 'convoy' | 'dashboard'
  convoyId?: string
}

// Map role strings to AgentType for the WebSocket connection
function roleToAgentType(role: string): AgentType {
  switch (role) {
    case 'mayor':
      return 'mayor'
    case 'deacon':
      return 'deacon'
    case 'witness':
      return 'witness'
    case 'refinery':
      return 'refinery'
    case 'polecat':
      return 'polecat'
    case 'crew':
    default:
      return 'crew'
  }
}

export function AgentDetail({ agentId, from, convoyId }: AgentDetailProps) {
  // Check if this is a polecat ID (polecat-<name>)
  const polecatMatch = agentId.match(/^polecat-(\w+)$/)
  if (polecatMatch) {
    const polecatName = polecatMatch[1]
    return (
      <AgentDetailView
        name={polecatName}
        role='polecat'
        agentType='polecat'
        icon='🐱'
        status='online'
        rig='gt_admin'
        from={from}
        convoyId={convoyId}
      />
    )
  }

  // Find agent from mock data
  const agent = mockAgents.find((a) => a.id === agentId)
  const crewMember = mockCrew.find((c) => c.id === agentId)

  // Handle crew members
  if (crewMember) {
    return (
      <AgentDetailView
        name={crewMember.name}
        role='crew'
        agentType='crew'
        icon='👷'
        status={crewMember.status}
        rig={null}
        from={from}
        convoyId={convoyId}
      />
    )
  }

  // Handle agents
  if (agent) {
    return (
      <AgentDetailView
        name={agent.name}
        role={agent.role}
        agentType={roleToAgentType(agent.role)}
        icon={agent.icon}
        status={agent.status}
        rig={agent.rig}
        from={from}
        convoyId={convoyId}
      />
    )
  }

  // Not found
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='flex flex-col items-center justify-center py-20'>
          <h1 className='text-2xl font-bold'>Agent Not Found</h1>
          <p className='mt-2 text-muted-foreground'>
            No agent with ID "{agentId}" exists.
          </p>
          <Button asChild className='mt-4'>
            <Link to='/town'>Back to Dashboard</Link>
          </Button>
        </div>
      </Main>
    </>
  )
}

interface AgentDetailViewProps {
  name: string
  role: string
  agentType: AgentType
  icon: string
  status: AgentStatus
  rig: string | null
  from?: 'convoy' | 'dashboard'
  convoyId?: string
}

function AgentDetailView({
  name,
  role,
  agentType,
  icon,
  status: _mockStatus,
  rig,
  from,
  convoyId,
}: AgentDetailViewProps) {
  // Note: _mockStatus is from mock data, we'll use real sessionConnected instead
  const [terminalOutput, setTerminalOutput] = useState<string>('')
  const [terminalError, setTerminalError] = useState<string | null>(null)

  // Handle terminal output
  const handleOutput = useCallback((data: string) => {
    setTerminalOutput(data)
    setTerminalError(null)
  }, [])

  // Handle errors
  const handleError = useCallback((message: string) => {
    // Don't show "not running" as an error - the offline badge indicates this
    if (message.includes('is not running')) {
      return
    }
    setTerminalError(message)
  }, [])

  // Use the terminal socket hook - single connection for the page
  const { status: wsStatus, sessionConnected, tmuxSession, sendCommand, sendInput, startSession, stopSession, reconnect } = useTerminalSocket({
    agentName: name,
    agentType,
    rig,
    onOutput: handleOutput,
    onError: handleError,
  })

  // Use real session status, not mock data
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
              {from === 'convoy' && convoyId && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to='/convoys'>Convoys</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{name}</BreadcrumbPage>
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
        {/* Agent Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <span className='text-4xl'>{icon}</span>
            <div>
              <h1 className='text-2xl font-bold'>{name}</h1>
              <p className='text-muted-foreground'>{role}</p>
            </div>
          </div>
          <Badge
            className={
              isOnline
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                : ''
            }
            variant={isOnline ? 'default' : 'outline'}
          >
            <Circle
              className={`mr-1 h-2 w-2 fill-current ${isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className='mb-6'>
          <ActionButtons
            sessionConnected={sessionConnected}
            onStart={startSession}
            onStop={stopSession}
            onSendCommand={sendCommand}
          />
        </div>

        {/* Info Cards */}
        <div className='mb-6 grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Status</CardTitle>
              <CardDescription>Current agent state</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>State</dt>
                  <dd className='font-medium'>
                    {isOnline ? 'Running' : 'Stopped'}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Rig</dt>
                  <dd className='font-medium'>{rig ?? 'Town-level'}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Role</dt>
                  <dd className='font-medium capitalize'>{role}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Session</dt>
                  <dd className='font-mono text-xs'>{tmuxSession ?? 'Not connected'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Current Task</CardTitle>
              <CardDescription>Active work assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {isOnline ? (
                <div className='text-sm'>
                  <p className='font-medium'>Awaiting instructions</p>
                  <p className='text-muted-foreground'>No task hooked</p>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Agent is offline
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terminal Panel */}
        <TerminalPanel
          session={tmuxSession ?? name}
          output={terminalOutput}
          error={terminalError}
          onInput={sendInput}
        />
      </Main>
    </>
  )
}
