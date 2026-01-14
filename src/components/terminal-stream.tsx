import { useEffect, useRef, useCallback, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Wifi, WifiOff, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type StreamStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

interface TerminalStreamProps {
  /** WebSocket URL for streaming */
  wsUrl: string
  /** Session name to display */
  sessionName: string
  /** Height of the terminal (default: 320px) */
  height?: number | string
  /** Whether to show the card wrapper */
  showCard?: boolean
  /** Whether to allow expanding to full height */
  expandable?: boolean
  /** Custom title */
  title?: string
  /** Callback when output is received */
  onOutput?: (data: string) => void
  /** Callback when status changes */
  onStatusChange?: (status: StreamStatus, sessionConnected: boolean) => void
  /** Callback when error occurs */
  onError?: (message: string) => void
  /** Additional class name */
  className?: string
}

const statusConfig: Record<
  StreamStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Wifi }
> = {
  connecting: { label: 'Connecting...', variant: 'secondary', icon: RefreshCw },
  connected: { label: 'Connected', variant: 'default', icon: Wifi },
  disconnected: { label: 'Disconnected', variant: 'destructive', icon: WifiOff },
  reconnecting: { label: 'Reconnecting...', variant: 'secondary', icon: RefreshCw },
}

const RECONNECT_DELAY = 3000

export function TerminalStream({
  wsUrl,
  sessionName,
  height = 320,
  showCard = true,
  expandable = true,
  title = 'Terminal',
  onOutput,
  onStatusChange,
  onError,
  className,
}: TerminalStreamProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevOutputRef = useRef<string>('')

  const [status, setStatus] = useState<StreamStatus>('connecting')
  const [sessionConnected, setSessionConnected] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
    }

    setStatus('connecting')
    onStatusChange?.('connecting', false)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'output':
            if (xtermRef.current && message.data) {
              const output = message.data
              // Append or replace based on content
              if (output.startsWith(prevOutputRef.current) && prevOutputRef.current.length > 0) {
                const newContent = output.slice(prevOutputRef.current.length)
                if (newContent) {
                  xtermRef.current.write(newContent)
                }
              } else {
                xtermRef.current.write('\x1b[H' + output + '\x1b[J')
              }
              prevOutputRef.current = output
              onOutput?.(output)
            }
            break

          case 'status':
            setSessionConnected(message.connected)
            onStatusChange?.(status, message.connected)
            if (!message.connected && message.tmuxSession) {
              const errMsg = `Session "${message.tmuxSession}" is not running`
              setError(errMsg)
              onError?.(errMsg)
            }
            break

          case 'error':
            setError(message.message)
            onError?.(message.message)
            break
        }
      } catch {
        // Ignore parse errors
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
      setSessionConnected(false)
      onStatusChange?.('disconnected', false)

      reconnectTimeoutRef.current = setTimeout(() => {
        setStatus('reconnecting')
        onStatusChange?.('reconnecting', false)
        connect()
      }, RECONNECT_DELAY)
    }

    ws.onerror = () => {
      const errMsg = 'WebSocket connection error'
      setError(errMsg)
      onError?.(errMsg)
    }
  }, [wsUrl, status, onOutput, onStatusChange, onError])

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return

    const timeoutId = setTimeout(() => {
      if (!terminalRef.current) return

      const term = new Terminal({
        cursorBlink: false,
        cursorStyle: 'block',
        disableStdin: true,
        fontSize: 13,
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        theme: {
          background: '#09090b',
          foreground: '#a1a1aa',
          cursor: '#a1a1aa',
          cursorAccent: '#09090b',
          selectionBackground: '#3f3f46',
          black: '#09090b',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#f4f4f5',
          brightBlack: '#52525b',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#fafafa',
        },
        scrollback: 5000,
        convertEol: true,
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)
      term.open(terminalRef.current!)
      fitAddon.fit()

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Welcome message
      term.writeln('\x1b[90m# Streaming from: ' + sessionName + '\x1b[0m')
      term.writeln('\x1b[90m# Waiting for output...\x1b[0m')
      term.writeln('')

      const handleResize = () => fitAddon.fit()
      window.addEventListener('resize', handleResize)

      return () => window.removeEventListener('resize', handleResize)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [sessionName])

  // Connect WebSocket
  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  // Refit terminal when expanded
  useEffect(() => {
    if (fitAddonRef.current) {
      setTimeout(() => fitAddonRef.current?.fit(), 100)
    }
  }, [expanded])

  const handleReconnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }))
    } else {
      connect()
    }
  }

  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.icon

  const terminalHeight = expanded ? 'calc(100vh - 300px)' : height

  const content = (
    <>
      {error && (
        <div className='mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          {error}
        </div>
      )}
      <div
        ref={terminalRef}
        className='overflow-hidden rounded-md bg-zinc-950 [&_.xterm-viewport]:!overflow-hidden'
        style={{ height: terminalHeight, contain: 'paint' }}
      />
    </>
  )

  if (!showCard) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-center justify-between pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <svg
            className='h-4 w-4'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <polyline points='4 17 10 11 4 5' />
            <line x1='12' y1='19' x2='20' y2='19' />
          </svg>
          {title}
          <span className='text-sm font-normal text-muted-foreground'>
            ({sessionName})
          </span>
        </CardTitle>
        <div className='flex items-center gap-2'>
          <Badge
            variant={statusInfo.variant}
            className={cn(
              status === 'connected' && sessionConnected &&
                'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
            )}
          >
            <StatusIcon
              className={cn(
                'mr-1 h-3 w-3',
                (status === 'connecting' || status === 'reconnecting') && 'animate-spin'
              )}
            />
            {statusInfo.label}
          </Badge>
          {expandable && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <Minimize2 className='h-4 w-4' />
              ) : (
                <Maximize2 className='h-4 w-4' />
              )}
            </Button>
          )}
          {status === 'disconnected' && (
            <Button variant='ghost' size='sm' onClick={handleReconnect}>
              <RefreshCw className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
