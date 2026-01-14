import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import type {
  TownStatus,
  TownAgent,
  Rig,
  TownConvoy,
} from '@/features/town-dashboard/hooks/use-town-status'

// Re-export types for convenience
export type { TownStatus, TownAgent, Rig, TownConvoy }

const WS_URL = 'ws://localhost:3001?subscribe=status'
const RECONNECT_DELAY = 2000 // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 10
const PING_INTERVAL = 30000 // 30 seconds

// Status change event types
export type StatusChangeType =
  | 'full'
  | 'agent-added'
  | 'agent-state'
  | 'agent-mail'
  | 'rig-added'
  | 'witness-state'
  | 'witness-mail'
  | 'refinery-state'
  | 'refinery-mq'
  | 'polecat-spawned'
  | 'polecat-state'
  | 'polecat-completed'
  | 'crew-joined'
  | 'crew-state'
  | 'crew-left'
  | 'convoy-created'
  | 'convoy-progress'
  | 'convoy-status'
  | 'convoy-removed'

export interface StatusChange {
  type: StatusChangeType
  data: unknown
}

export interface StatusUpdate {
  type: 'status-update'
  changes: StatusChange[]
  timestamp: number
  fullStatus?: TownStatus
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface RealtimeStatusContextState {
  status: TownStatus | null
  connectionStatus: ConnectionStatus
  lastUpdate: number | null
  changes: StatusChange[]
  error: string | null
  reconnect: () => void
}

const initialState: RealtimeStatusContextState = {
  status: null,
  connectionStatus: 'disconnected',
  lastUpdate: null,
  changes: [],
  error: null,
  reconnect: () => {},
}

const RealtimeStatusContext =
  createContext<RealtimeStatusContextState>(initialState)

interface RealtimeStatusProviderProps {
  children: React.ReactNode
}

export function RealtimeStatusProvider({
  children,
}: RealtimeStatusProviderProps) {
  const [status, setStatus] = useState<TownStatus | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected')
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)
  const [changes, setChanges] = useState<StatusChange[]>([])
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setConnectionStatus('connecting')
    setError(null)

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        setError(null)
        reconnectAttemptsRef.current = 0

        // Start ping interval for keepalive
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, PING_INTERVAL)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'status-update') {
            const update = message as StatusUpdate

            // Update changes (keep last 50 for history)
            setChanges((prev) => [...update.changes, ...prev].slice(0, 50))
            setLastUpdate(update.timestamp)

            // Apply changes to status
            if (update.fullStatus) {
              setStatus(update.fullStatus)
            } else {
              // Apply incremental updates
              setStatus((prevStatus) => {
                if (!prevStatus) return null
                return applyChanges(prevStatus, update.changes)
              })
            }
          } else if (message.type === 'error') {
            setError(message.message)
          }
        } catch {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        setConnectionStatus('disconnected')
        wsRef.current = null

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        // Attempt reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++
          const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1)
          reconnectTimeoutRef.current = setTimeout(connect, Math.min(delay, 30000))
        } else {
          setError('Max reconnection attempts reached')
        }
      }

      ws.onerror = () => {
        setConnectionStatus('error')
        setError('WebSocket connection error')
      }
    } catch {
      setConnectionStatus('error')
      setError('Failed to create WebSocket connection')
    }
  }, [])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const contextValue = useMemo(
    () => ({
      status,
      connectionStatus,
      lastUpdate,
      changes,
      error,
      reconnect,
    }),
    [status, connectionStatus, lastUpdate, changes, error, reconnect]
  )

  return (
    <RealtimeStatusContext value={contextValue}>
      {children}
    </RealtimeStatusContext>
  )
}

// Apply incremental changes to status
function applyChanges(status: TownStatus, changes: StatusChange[]): TownStatus {
  let newStatus = { ...status }

  for (const change of changes) {
    switch (change.type) {
      case 'full':
        newStatus = change.data as TownStatus
        break

      case 'agent-state': {
        const data = change.data as { name: string; online: boolean }
        newStatus = {
          ...newStatus,
          townAgents: newStatus.townAgents.map((agent) =>
            agent.name === data.name ? { ...agent, online: data.online } : agent
          ),
        }
        break
      }

      case 'agent-mail': {
        const data = change.data as { name: string; mailCount: number }
        newStatus = {
          ...newStatus,
          townAgents: newStatus.townAgents.map((agent) =>
            agent.name === data.name
              ? { ...agent, mailCount: data.mailCount }
              : agent
          ),
        }
        break
      }

      case 'witness-state': {
        const data = change.data as { rig: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? { ...rig, witness: { ...rig.witness, online: data.online } }
              : rig
          ),
        }
        break
      }

      case 'witness-mail': {
        const data = change.data as { rig: string; mailCount: number }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? { ...rig, witness: { ...rig.witness, mailCount: data.mailCount } }
              : rig
          ),
        }
        break
      }

      case 'refinery-state': {
        const data = change.data as { rig: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? { ...rig, refinery: { ...rig.refinery, online: data.online } }
              : rig
          ),
        }
        break
      }

      case 'refinery-mq': {
        const data = change.data as { rig: string; mqCount: number }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? { ...rig, refinery: { ...rig.refinery, mqCount: data.mqCount } }
              : rig
          ),
        }
        break
      }

      case 'polecat-spawned': {
        const data = change.data as { rig: string; name: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  polecats: [
                    ...rig.polecats,
                    { name: data.name, online: data.online },
                  ],
                }
              : rig
          ),
        }
        break
      }

      case 'polecat-state': {
        const data = change.data as { rig: string; name: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  polecats: rig.polecats.map((p) =>
                    p.name === data.name ? { ...p, online: data.online } : p
                  ),
                }
              : rig
          ),
        }
        break
      }

      case 'polecat-completed': {
        const data = change.data as { rig: string; name: string }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  polecats: rig.polecats.filter((p) => p.name !== data.name),
                }
              : rig
          ),
        }
        break
      }

      case 'crew-joined': {
        const data = change.data as { rig: string; name: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  crew: [...rig.crew, { name: data.name, online: data.online }],
                }
              : rig
          ),
        }
        break
      }

      case 'crew-state': {
        const data = change.data as { rig: string; name: string; online: boolean }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  crew: rig.crew.map((c) =>
                    c.name === data.name ? { ...c, online: data.online } : c
                  ),
                }
              : rig
          ),
        }
        break
      }

      case 'crew-left': {
        const data = change.data as { rig: string; name: string }
        newStatus = {
          ...newStatus,
          rigs: newStatus.rigs.map((rig) =>
            rig.name === data.rig
              ? {
                  ...rig,
                  crew: rig.crew.filter((c) => c.name !== data.name),
                }
              : rig
          ),
        }
        break
      }

      case 'convoy-created': {
        const data = change.data as TownConvoy
        newStatus = {
          ...newStatus,
          convoys: [...newStatus.convoys, data],
        }
        break
      }

      case 'convoy-progress': {
        const data = change.data as {
          id: string
          completed: number
          total: number
        }
        newStatus = {
          ...newStatus,
          convoys: newStatus.convoys.map((convoy) =>
            convoy.id === data.id
              ? { ...convoy, completed: data.completed, total: data.total }
              : convoy
          ),
        }
        break
      }

      case 'convoy-status': {
        const data = change.data as { id: string; status: 'active' | 'completed' }
        newStatus = {
          ...newStatus,
          convoys: newStatus.convoys.map((convoy) =>
            convoy.id === data.id ? { ...convoy, status: data.status } : convoy
          ),
        }
        break
      }

      case 'convoy-removed': {
        const data = change.data as { id: string }
        newStatus = {
          ...newStatus,
          convoys: newStatus.convoys.filter((convoy) => convoy.id !== data.id),
        }
        break
      }
    }
  }

  return newStatus
}

// ============================================================================
// Hooks
// ============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useRealtimeStatus() {
  const context = useContext(RealtimeStatusContext)
  if (!context) {
    throw new Error(
      'useRealtimeStatus must be used within a RealtimeStatusProvider'
    )
  }
  return context
}

// Hook for town agents specifically
// eslint-disable-next-line react-refresh/only-export-components
export function useAgents() {
  const { status, connectionStatus, error } = useRealtimeStatus()

  return useMemo(
    () => ({
      agents: status?.townAgents ?? [],
      loading: connectionStatus === 'connecting' && !status,
      connected: connectionStatus === 'connected',
      error,
    }),
    [status, connectionStatus, error]
  )
}

// Hook for rigs specifically
// eslint-disable-next-line react-refresh/only-export-components
export function useRigs() {
  const { status, connectionStatus, error } = useRealtimeStatus()

  return useMemo(
    () => ({
      rigs: status?.rigs ?? [],
      loading: connectionStatus === 'connecting' && !status,
      connected: connectionStatus === 'connected',
      error,
    }),
    [status, connectionStatus, error]
  )
}

// Hook for convoys specifically
// eslint-disable-next-line react-refresh/only-export-components
export function useConvoys() {
  const { status, connectionStatus, error } = useRealtimeStatus()

  return useMemo(
    () => ({
      convoys: status?.convoys ?? [],
      activeConvoys: status?.convoys.filter((c) => c.status === 'active') ?? [],
      loading: connectionStatus === 'connecting' && !status,
      connected: connectionStatus === 'connected',
      error,
    }),
    [status, connectionStatus, error]
  )
}

// Hook for a specific rig
// eslint-disable-next-line react-refresh/only-export-components
export function useRig(rigName: string) {
  const { status, connectionStatus, error } = useRealtimeStatus()

  return useMemo(
    () => ({
      rig: status?.rigs.find((r) => r.name === rigName) ?? null,
      loading: connectionStatus === 'connecting' && !status,
      connected: connectionStatus === 'connected',
      error,
    }),
    [status, connectionStatus, error, rigName]
  )
}

// Hook for recent changes (for notifications/activity feed)
// eslint-disable-next-line react-refresh/only-export-components
export function useStatusChanges(limit = 10) {
  const { changes, lastUpdate } = useRealtimeStatus()

  return useMemo(
    () => ({
      changes: changes.slice(0, limit),
      lastUpdate,
    }),
    [changes, limit, lastUpdate]
  )
}
