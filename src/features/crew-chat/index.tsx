import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Send, Users, Circle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTerminalSocket } from '@/features/agent-detail/hooks/use-terminal-socket'
import { useTownStatus } from '@/features/town-dashboard/hooks/use-town-status'

type Message = {
  id: string
  sender: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface CrewChatProps {
  rigId: string
  crewId: string
}

export function CrewChat({ rigId, crewId }: CrewChatProps) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { status: townStatus, loading: townLoading } = useTownStatus()

  // Find the rig and crew members
  const rig = townStatus?.rigs.find((r) => r.name === rigId)
  const crewMembers = rig?.crew ?? []

  // Handle terminal output - convert to chat messages
  const handleOutput = useCallback((data: string) => {
    if (!data.trim()) return

    // Add agent output as a message
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      content: data.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [newMessage, ...prev])
  }, [])

  // Handle errors
  const handleError = useCallback((message: string) => {
    const errorMessage: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      content: `Error: ${message}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [errorMessage, ...prev])
  }, [])

  // Connect to tmux session
  const {
    status: wsStatus,
    sessionConnected,
    tmuxSession,
    sendCommand,
    reconnect,
  } = useTerminalSocket({
    agentName: crewId,
    agentType: 'crew',
    rig: rigId,
    onOutput: handleOutput,
    onError: handleError,
  })

  // Add welcome message when connected
  useEffect(() => {
    if (sessionConnected && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'agent',
        content: `Connected to ${crewId}'s tmux session. You can now send commands.`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [sessionConnected, crewId, messages.length])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message to chat
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [newMessage, ...prev])

    // Send command to tmux
    sendCommand(inputValue.trim())
    setInputValue('')
  }

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
          <div className='w-64 shrink-0 rounded-lg border bg-card'>
            <div className='border-b p-4'>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                <h2 className='font-semibold'>Crew Members</h2>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {rigId} rig
              </p>
            </div>
            <ScrollArea className='h-[calc(100%-73px)]'>
              <div className='p-2'>
                {townLoading ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    Loading...
                  </div>
                ) : crewMembers.length === 0 ? (
                  <div className='p-4 text-center text-sm text-muted-foreground'>
                    No crew members
                  </div>
                ) : (
                  crewMembers.map((member) => (
                    <button
                      key={member.name}
                      onClick={() => handleCrewSelect(member.name)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                        member.name === crewId
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted'
                      )}
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

          {/* Main Chat Area */}
          <div className='flex flex-1 flex-col overflow-hidden rounded-lg border bg-card'>
            {/* Chat Header */}
            <div className='flex items-center justify-between border-b px-4 py-3'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback>
                    {crewId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className='text-lg font-semibold'>{crewId}</h1>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <span>{rigId}</span>
                    <span>·</span>
                    <span className='font-mono text-xs'>
                      {tmuxSession ?? 'No session'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={sessionConnected ? 'default' : 'outline'}
                  className={
                    sessionConnected
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                      : ''
                  }
                >
                  <Circle
                    className={cn(
                      'mr-1 h-2 w-2 fill-current',
                      sessionConnected
                        ? 'text-emerald-500'
                        : 'text-muted-foreground'
                    )}
                  />
                  {sessionConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                {wsStatus === 'disconnected' && (
                  <Button variant='ghost' size='sm' onClick={reconnect}>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className='flex-1 px-4' ref={scrollAreaRef}>
              <div className='flex flex-col-reverse gap-4 py-4'>
                {messages.length === 0 ? (
                  <div className='py-20 text-center text-muted-foreground'>
                    {sessionConnected
                      ? 'Send a message to start chatting'
                      : 'Connecting to session...'}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'max-w-[80%] rounded-lg px-4 py-3',
                        message.sender === 'user'
                          ? 'self-end bg-primary text-primary-foreground'
                          : 'self-start bg-muted'
                      )}
                    >
                      <pre className='whitespace-pre-wrap font-mono text-sm'>
                        {message.content}
                      </pre>
                      <span
                        className={cn(
                          'mt-1 block text-xs',
                          message.sender === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}
                      >
                        {format(message.timestamp, 'h:mm a')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className='flex gap-2 border-t p-4'
            >
              <label className='flex-1'>
                <span className='sr-only'>Send command to {crewId}</span>
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    sessionConnected
                      ? 'Type a command...'
                      : 'Waiting for connection...'
                  }
                  disabled={!sessionConnected}
                  className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </label>
              <Button type='submit' size='icon' disabled={!sessionConnected}>
                <Send className='h-4 w-4' />
                <span className='sr-only'>Send command</span>
              </Button>
            </form>
          </div>
        </div>
      </Main>
    </>
  )
}
