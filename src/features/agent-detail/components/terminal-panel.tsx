import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

interface TerminalPanelProps {
  session: string
  output: string
  error: string | null
  onInput?: (data: string) => void
  onResize?: (cols: number, rows: number) => void
}

export function TerminalPanel({
  session,
  output,
  error,
  onInput,
  onResize,
}: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const onInputRef = useRef(onInput)
  const onResizeRef = useRef(onResize)

  // Keep refs updated
  useEffect(() => {
    onInputRef.current = onInput
    onResizeRef.current = onResize
  }, [onInput, onResize])

  // Initialize xterm with ResizeObserver to handle flex containers
  useEffect(() => {
    if (!terminalRef.current) return

    const container = terminalRef.current

    const term = new Terminal({
      cursorBlink: false,
      cursorStyle: 'bar',
      cursorInactiveStyle: 'none',
      disableStdin: false,
      fontSize: 13,
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      theme: {
        background: '#09090b',
        foreground: '#a1a1aa',
        cursor: 'transparent',
        cursorAccent: 'transparent',
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
      scrollback: 1000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    term.open(container)
    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Fit terminal to container
    const fitTerminal = () => {
      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        fitAddon.fit()
      }
    }

    // Use ResizeObserver just to fit xterm display
    const resizeObserver = new ResizeObserver(fitTerminal)
    resizeObserver.observe(container)

    // Window resize - just fit, no tmux notification
    window.addEventListener('resize', fitTerminal)

    // ONE-TIME resize notification on mount only
    setTimeout(() => {
      fitTerminal()
      if (onResizeRef.current && term.cols && term.rows) {
        onResizeRef.current(term.cols, term.rows)
      }
    }, 200)

    // Handle user input - send to PTY
    term.onData((data) => {
      if (onInputRef.current) {
        onInputRef.current(data)
      }
    })

    // Auto-focus the terminal
    term.focus()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', fitTerminal)
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [session])

  // Track previous output to avoid unnecessary rewrites
  const prevOutputRef = useRef<string>('')

  // Update terminal with new output
  useEffect(() => {
    if (!xtermRef.current || !output) return

    // Only update if content actually changed
    if (output !== prevOutputRef.current) {
      // Clear and rewrite - use escape codes instead of reset()
      xtermRef.current.write('\x1b[2J\x1b[H' + output)
      prevOutputRef.current = output
    }
  }, [output])


  return (
    <div className='h-full flex flex-col'>
      {error && (
        <div className='mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          {error}
        </div>
      )}
      <div
        ref={terminalRef}
        className='flex-1 rounded-md bg-zinc-950 cursor-text p-2 [&_.xterm-cursor]:!hidden [&_.xterm-cursor-layer]:!opacity-0'
        onClick={() => xtermRef.current?.focus()}
      />
    </div>
  )
}
