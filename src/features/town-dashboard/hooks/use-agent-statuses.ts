import { useState, useEffect, useCallback } from 'react'

interface AgentStatus {
  name: string
  type: string
  rig: string | null
  icon: string
  tmuxSession: string
  online: boolean
}

const API_URL = 'http://localhost:3001/api/agents/status'
const POLL_INTERVAL = 5000 // Poll every 5 seconds

export function useAgentStatuses() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setStatuses(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch agent statuses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatuses()
    const interval = setInterval(fetchStatuses, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchStatuses])

  // Helper to get status for a specific agent
  const getStatus = useCallback(
    (name: string): 'online' | 'offline' => {
      const agent = statuses.find((s) => s.name === name)
      return agent?.online ? 'online' : 'offline'
    },
    [statuses]
  )

  return { statuses, loading, error, getStatus, refetch: fetchStatuses }
}
