import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Send, Crown, Wifi, WifiOff, RefreshCw } from 'lucide-react'
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

type Message = {
  id: string
  sender: 'user' | 'mayor'
  content: string
  timestamp: Date
  streaming?: boolean
}

// Strip ANSI escape codes from terminal output
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
}

// Parse terminal output to extract meaningful content
function parseTerminalOutput(output: string): string {
  const stripped = stripAnsi(output)
  const lines = stripped.split('\n')

  // Filter out empty lines and clean up
  const cleanLines = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Get the last meaningful chunk (after last prompt or command)
  // This is a simple heuristic - we take recent non-empty lines
  const recentLines = cleanLines.slice(-50)
  return recentLines.join('\n')
}

export function Mayor() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [currentResponse, setCurrentResponse] = useState<string>('')
  const lastOutputRef = useRef<string>('')
  const responseIdRef = useRef<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleOutput = useCallback((data: string) => {
    // Update the current streaming response
    const parsed = parseTerminalOutput(data)

    // Only update if content changed meaningfully
    if (parsed !== lastOutputRef.current) {
      lastOutputRef.current = parsed

      // If we have a pending response, update it
      if (responseIdRef.current) {
        setMessages(prev => prev.map(msg =>
          msg.id === responseIdRef.current
            ? { ...msg, content: parsed, timestamp: new Date() }
            : msg
        ))
      } else {
        // First output after connection - show welcome
        setCurrentResponse(parsed)
      }
    }
  }, [])

  const handleError = useCallback((_message: string) => {
    // Error handling could be expanded to show toast notifications
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, currentResponse])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    // Create a placeholder for the Mayor's response
    const responseId = (Date.now() + 1).toString()
    const mayorResponse: Message = {
      id: responseId,
      sender: 'mayor',
      content: '...',
      timestamp: new Date(),
      streaming: true,
    }

    responseIdRef.current = responseId
    setMessages(prev => [...prev, userMessage, mayorResponse])

    // Send the command to Mayor's tmux session
    sendCommand(inputValue.trim())
    setInputValue('')
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
        <section className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex items-center gap-4 border-b pb-4'>
            <Avatar className='size-12'>
              <AvatarImage src='/avatars/mayor.jpg' alt='Mayor' />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                <Crown className='size-6' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold tracking-tight'>Mayor</h1>
              <p className='text-sm text-muted-foreground'>
                {tmuxSession ? `Session: ${tmuxSession}` : 'Your AI assistant for task coordination'}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant={sessionConnected ? 'default' : status === 'connecting' || status === 'reconnecting' ? 'secondary' : 'destructive'}
                className={sessionConnected ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : ''}
              >
                {sessionConnected ? (
                  <>
                    <Wifi className='mr-1 h-3 w-3' />
                    Connected
                  </>
                ) : status === 'connecting' || status === 'reconnecting' ? (
                  <>
                    <RefreshCw className='mr-1 h-3 w-3 animate-spin' />
                    {status === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
                  </>
                ) : (
                  <>
                    <WifiOff className='mr-1 h-3 w-3' />
                    Disconnected
                  </>
                )}
              </Badge>
              {!sessionConnected && status === 'disconnected' && (
                <Button variant='ghost' size='sm' onClick={reconnect}>
                  <RefreshCw className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className='flex flex-1 flex-col overflow-hidden pt-4'>
            <ScrollArea className='flex-1 pr-4' ref={scrollAreaRef}>
              <div className='flex flex-col gap-4 pb-4'>
                {/* Welcome message when connected but no messages */}
                {messages.length === 0 && sessionConnected && (
                  <div className='self-start max-w-[80%] rounded-lg px-4 py-3 bg-muted'>
                    <p className='text-sm'>
                      Connected to Mayor. Type a message to interact with the Mayor's tmux session.
                    </p>
                    <span className='mt-1 block text-xs text-muted-foreground'>
                      {format(new Date(), 'h:mm a')}
                    </span>
                  </div>
                )}
                {/* Not connected message */}
                {!sessionConnected && messages.length === 0 && (
                  <div className='self-start max-w-[80%] rounded-lg px-4 py-3 bg-muted'>
                    <p className='text-sm text-muted-foreground'>
                      {status === 'connecting' || status === 'reconnecting'
                        ? 'Connecting to Mayor session...'
                        : 'Mayor session is not running. Start the Mayor with `gt mayor start` to connect.'}
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-3',
                      message.sender === 'user'
                        ? 'self-end bg-primary text-primary-foreground'
                        : 'self-start bg-muted'
                    )}
                  >
                    <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
                    <span
                      className={cn(
                        'mt-1 block text-xs',
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {format(message.timestamp, 'h:mm a')}
                      {message.streaming && ' • streaming...'}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className='flex gap-2 border-t pt-4'
            >
              <label className='flex-1'>
                <span className='sr-only'>Message the Mayor</span>
                <input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={sessionConnected ? 'Type your message...' : 'Connect to Mayor to send messages...'}
                  disabled={!sessionConnected}
                  className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
              </label>
              <Button type='submit' size='icon' disabled={!sessionConnected || !inputValue.trim()}>
                <Send className='size-4' />
                <span className='sr-only'>Send message</span>
              </Button>
            </form>
          </div>
        </section>
      </Main>
    </>
  )
}
