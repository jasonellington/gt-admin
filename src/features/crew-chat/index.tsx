import { useCallback, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Circle, FolderGit2, HardHat } from 'lucide-react'
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
import { TerminalPanel } from '@/features/agent-detail/components/terminal-panel'
import { ActionButtons } from '@/features/agent-detail/components/action-buttons'
import { useTerminalSocket } from '@/features/agent-detail/hooks/use-terminal-socket'
import { mockCrew } from '@/features/town-dashboard/data/mock-data'

interface CrewChatProps {
  crewName: string
  rigName?: string
}

export function CrewChat({ crewName, rigName }: CrewChatProps) {
  const crewMember = mockCrew.find((c) => c.name === crewName)

  if (!crewMember) {
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
            <h1 className='text-2xl font-bold'>Crew Workspace Not Found</h1>
            <p className='mt-2 text-muted-foreground'>
              No crew workspace named "{crewName}" exists.
            </p>
            <Button asChild className='mt-4'>
              <Link to='/town'>Back to Dashboard</Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

  return (
    <CrewChatView
      name={crewMember.name}
      status={crewMember.status}
      rigName={rigName ?? 'gt_admin'}
    />
  )
}

interface CrewChatViewProps {
  name: string
  status: 'online' | 'offline'
  rigName: string
}

function CrewChatView({ name, status: _mockStatus, rigName }: CrewChatViewProps) {
  const [terminalOutput, setTerminalOutput] = useState<string>('')
  const [terminalError, setTerminalError] = useState<string | null>(null)

  const handleOutput = useCallback((data: string) => {
    setTerminalOutput(data)
    setTerminalError(null)
  }, [])

  const handleError = useCallback((message: string) => {
    setTerminalError(message)
  }, [])

  const {
    status: wsStatus,
    sessionConnected,
    tmuxSession,
    sendCommand,
    startSession,
    stopSession,
    reconnect,
  } = useTerminalSocket({
    agentName: name,
    agentType: 'crew',
    rig: rigName,
    onOutput: handleOutput,
    onError: handleError,
  })

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
                <BreadcrumbLink asChild>
                  <Link to='/rigs/$rigName' params={{ rigName }}>
                    {rigName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Crew: {name}</BreadcrumbPage>
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
        {/* Crew Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
              <HardHat className='h-6 w-6 text-amber-600 dark:text-amber-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold'>{name}</h1>
              <p className='text-muted-foreground'>Crew Workspace</p>
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
              <CardTitle className='text-base'>Workspace Status</CardTitle>
              <CardDescription>Current workspace state</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>State</dt>
                  <dd className='font-medium'>
                    {isOnline ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Rig</dt>
                  <dd className='font-medium'>{rigName}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Type</dt>
                  <dd className='font-medium'>Human-managed workspace</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Session</dt>
                  <dd className='font-mono text-xs'>
                    {tmuxSession ?? 'Not connected'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <FolderGit2 className='h-4 w-4' />
                Workspace Info
              </CardTitle>
              <CardDescription>Workspace details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Owner</dt>
                  <dd className='font-medium capitalize'>{name}</dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Path</dt>
                  <dd className='font-mono text-xs truncate max-w-[200px]'>
                    {rigName}/crew/{name}
                  </dd>
                </div>
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Access</dt>
                  <dd className='font-medium'>Full control</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Terminal Panel */}
        <TerminalPanel
          session={tmuxSession ?? `crew-${name}`}
          output={terminalOutput}
          status={wsStatus}
          sessionConnected={sessionConnected}
          error={terminalError}
          onReconnect={reconnect}
        />
      </Main>
    </>
  )
}
