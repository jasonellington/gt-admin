import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Send, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTerminalSocket, type AgentType } from '@/features/agent-detail/hooks/use-terminal-socket'

interface TerminalChatProps {
  agentName: string
  agentType: AgentType
  rig?: string | null
  title?: string
  className?: string
  height?: string
}

const statusConfig = {
  connecting: {
    label: 'Connecting...',
    variant: 'secondary' as const,
    Icon: RefreshCw,
    animate: true,
  },
  connected: {
    label: 'Connected',
    variant: 'default' as const,
    Icon: Wifi,
    animate: false,
  },
  disconnected: {
    label: 'Disconnected',
    variant: 'destructive' as const,
    Icon: WifiOff,
    animate: false,
  },
  reconnecting: {
    label: 'Reconnecting...',
    variant: 'secondary' as const,
    Icon: RefreshCw,
    animate: true,
  },
}

export function TerminalChat({
  agentName,
  agentType,
  rig = null,
  title,
  className = '',
  height = 'h-96',
}: TerminalChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const prevOutputRef = useRef<string>('')

  const handleOutput = useCallback((data: string) => {
    setOutput(data)
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
    agentName,
    agentType,
    rig,
    onOutput: handleOutput,
    onError: handleError,
  })

  // Initialize xterm
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

      const handleResize = () => {
        fitAddon.fit()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [])

  // Update terminal with new output
  useEffect(() => {
    if (!xtermRef.current || !output) return

    if (output.startsWith(prevOutputRef.current) && prevOutputRef.current.length > 0) {
      const newContent = output.slice(prevOutputRef.current.length)
      if (newContent) {
        xtermRef.current.write(newContent)
      }
    } else {
      xtermRef.current.write('\x1b[H' + output + '\x1b[J')
    }
    prevOutputRef.current = output
  }, [output])

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !sessionConnected) return

    sendCommand(inputValue.trim())
    setInputValue('')
    setError(null)
  }

  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.Icon

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between border-b pb-3 mb-3'>
        <div className='flex items-center gap-2'>
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
          <span className='font-medium'>
            {title || `Terminal: ${tmuxSession || agentName}`}
          </span>
        </div>
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
              className={`mr-1 h-3 w-3 ${statusInfo.animate ? 'animate-spin' : ''}`}
            />
            {statusInfo.label}
          </Badge>
          {status === 'disconnected' && (
            <Button variant='ghost' size='sm' onClick={reconnect}>
              <RefreshCw className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className='mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Terminal display */}
      <div
        ref={terminalRef}
        className={`${height} overflow-hidden rounded-md bg-zinc-950 [&_.xterm-viewport]:!overflow-hidden`}
        style={{ contain: 'paint' }}
      />

      {/* Input area */}
      <form onSubmit={handleSendCommand} className='flex gap-2 mt-3'>
        <label className='flex-1'>
          <span className='sr-only'>Send command</span>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={sessionConnected ? 'Type a command...' : 'Not connected...'}
            disabled={!sessionConnected}
            className='h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </label>
        <Button type='submit' size='icon' disabled={!sessionConnected || !inputValue.trim()}>
          <Send className='size-4' />
          <span className='sr-only'>Send</span>
        </Button>
      </form>
    </div>
  )
}
