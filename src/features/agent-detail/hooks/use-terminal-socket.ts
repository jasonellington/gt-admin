import { useCallback, useEffect, useRef, useState } from 'react'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
export type AgentType = 'mayor' | 'deacon' | 'witness' | 'refinery' | 'polecat' | 'crew'

interface UseTerminalSocketOptions {
  agentName: string
  agentType: AgentType
  rig: string | null
  wsUrl?: string
  onOutput?: (data: string) => void
  onError?: (message: string) => void
}

interface UseTerminalSocketReturn {
  status: ConnectionStatus
  sessionConnected: boolean
  tmuxSession: string | null
  sendCommand: (command: string) => void
  sendInput: (data: string) => void
  sendResize: (cols: number, rows: number) => void
  startSession: () => void
  stopSession: () => void
  reconnect: () => void
}

const DEFAULT_WS_URL = 'ws://localhost:3001'
const RECONNECT_DELAY = 3000

export function useTerminalSocket({
  agentName,
  agentType,
  rig,
  wsUrl = DEFAULT_WS_URL,
  onOutput,
  onError,
}: UseTerminalSocketOptions): UseTerminalSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [sessionConnected, setSessionConnected] = useState(false)
  const [tmuxSession, setTmuxSession] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Store callbacks in refs to avoid dependency issues
  const onOutputRef = useRef(onOutput)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onOutputRef.current = onOutput
    onErrorRef.current = onError
  }, [onOutput, onError])

  useEffect(() => {
    mountedRef.current = true

    const connect = () => {
      if (!mountedRef.current) return

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      setStatus('connecting')

      const params = new URLSearchParams({
        agent: agentName,
        type: agentType,
      })
      if (rig) {
        params.set('rig', rig)
      }

      const ws = new WebSocket(`${wsUrl}?${params.toString()}`)
      wsRef.current = ws

      ws.onopen = () => {
        // Check if this is still the current websocket
        if (wsRef.current !== ws) {
          ws.close()
          return
        }
        setStatus('connected')
      }

      ws.onmessage = (event) => {
        // Check if this is still the current websocket
        if (wsRef.current !== ws) return

        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case 'output':
              onOutputRef.current?.(message.data)
              break

            case 'status':
              setSessionConnected(message.connected)
              setTmuxSession(message.tmuxSession || null)
              break

            case 'error':
              onErrorRef.current?.(message.message)
              break

            case 'session-started':
            case 'session-stopped':
            case 'command-sent':
              break
          }
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        // Only handle close if this is still the current websocket
        if (wsRef.current !== ws) return

        setStatus('disconnected')
        setSessionConnected(false)

        // Only reconnect if still mounted
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setStatus('reconnecting')
            connect()
          }
        }, RECONNECT_DELAY)
      }

      ws.onerror = () => {
        console.warn('WebSocket connection error - will reconnect')
      }
    }

    connect()

    return () => {
      mountedRef.current = false

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (wsRef.current) {
        const ws = wsRef.current
        wsRef.current = null  // Clear ref before closing so onclose is ignored
        ws.close()
      }
    }
  }, [agentName, agentType, rig, wsUrl])

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command,
      }))
    }
  }, [])

  const sendInput = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'input',
        data,
      }))
    }
  }, [])

  const sendResize = useCallback((cols: number, rows: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'resize',
        cols,
        rows,
      }))
    }
  }, [])

  const startSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start' }))
    }
  }, [])

  const stopSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
    }
  }, [])

  const reconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }))
    }
  }, [])

  return {
    status,
    sessionConnected,
    tmuxSession,
    sendCommand,
    sendInput,
    sendResize,
    startSession,
    stopSession,
    reconnect,
  }
}
