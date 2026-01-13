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

  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
    }

    setStatus('connecting')

    // Build URL with agent info
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
      setStatus('connected')
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'output':
            onOutput?.(message.data)
            break

          case 'status':
            setSessionConnected(message.connected)
            setTmuxSession(message.tmuxSession || null)
            if (!message.connected) {
              onError?.(`Session "${message.tmuxSession}" is not running`)
            }
            break

          case 'error':
            onError?.(message.message)
            break

          case 'session-started':
          case 'session-stopped':
          case 'command-sent':
            // These are acknowledgments
            break
        }
      } catch {
        // Ignore parse errors
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')
      setSessionConnected(false)

      reconnectTimeoutRef.current = setTimeout(() => {
        setStatus('reconnecting')
        connect()
      }, RECONNECT_DELAY)
    }

    ws.onerror = () => {
      onError?.('WebSocket connection error')
    }
  }, [agentName, agentType, rig, wsUrl, onOutput, onError])

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

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command,
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
    } else {
      connect()
    }
  }, [connect])

  return {
    status,
    sessionConnected,
    tmuxSession,
    sendCommand,
    startSession,
    stopSession,
    reconnect,
  }
}
