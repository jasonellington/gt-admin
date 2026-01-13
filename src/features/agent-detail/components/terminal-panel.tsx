import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ConnectionStatus } from '../hooks/use-terminal-socket'

interface TerminalPanelProps {
  session: string
  output: string
  status: ConnectionStatus
  sessionConnected: boolean
  error: string | null
  onReconnect: () => void
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Wifi }
> = {
  connecting: {
    label: 'Connecting...',
    variant: 'secondary',
    icon: RefreshCw,
  },
  connected: {
    label: 'Connected',
    variant: 'default',
    icon: Wifi,
  },
  disconnected: {
    label: 'Disconnected',
    variant: 'destructive',
    icon: WifiOff,
  },
  reconnecting: {
    label: 'Reconnecting...',
    variant: 'secondary',
    icon: RefreshCw,
  },
}

export function TerminalPanel({
  session,
  output,
  status,
  sessionConnected,
  error,
  onReconnect,
}: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  // Initialize xterm (defer to ensure container has dimensions)
  useEffect(() => {
    if (!terminalRef.current) return

    // Defer initialization to next frame to ensure container is rendered
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

      // Handle resize
      const handleResize = () => {
        fitAddon.fit()
      }
      window.addEventListener('resize', handleResize)

      // Welcome message
      term.writeln('\x1b[90m# Terminal connected to session: ' + session + '\x1b[0m')
      term.writeln('\x1b[90m# Waiting for output...\x1b[0m')
      term.writeln('')
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [session])

  // Track previous output to avoid unnecessary rewrites
  const prevOutputRef = useRef<string>('')

  // Update terminal with new output - no flash approach
  useEffect(() => {
    if (!xtermRef.current || !output) return

    // If output starts with previous output, just append the new part
    if (output.startsWith(prevOutputRef.current) && prevOutputRef.current.length > 0) {
      const newContent = output.slice(prevOutputRef.current.length)
      if (newContent) {
        xtermRef.current.write(newContent)
      }
    } else {
      // Move cursor to home position and write content
      // \x1b[H = cursor to home (0,0)
      // \x1b[J = clear from cursor to end of screen
      // Writing content first, then clearing remainder prevents flash
      xtermRef.current.write('\x1b[H' + output + '\x1b[J')
    }
    prevOutputRef.current = output
  }, [output])

  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.icon

  return (
    <Card>
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
          Output
          <span className='text-sm font-normal text-muted-foreground'>
            ({session})
          </span>
        </CardTitle>
        <div className='flex items-center gap-2'>
          <Badge
            variant={statusInfo.variant}
            className={
              status === 'connected' && sessionConnected
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                : ''
            }
          >
            <StatusIcon
              className={`mr-1 h-3 w-3 ${status === 'connecting' || status === 'reconnecting' ? 'animate-spin' : ''}`}
            />
            {statusInfo.label}
          </Badge>
          {status === 'disconnected' && (
            <Button variant='ghost' size='sm' onClick={onReconnect}>
              <RefreshCw className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className='mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            {error}
          </div>
        )}
        <div
          ref={terminalRef}
          className='h-80 overflow-hidden rounded-md bg-zinc-950 [&_.xterm-viewport]:!overflow-hidden'
          style={{ contain: 'paint' }}
        />
      </CardContent>
    </Card>
  )
}
