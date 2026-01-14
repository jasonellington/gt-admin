import { useState, useEffect, useCallback, useRef } from 'react'

export interface TownAgent {
  name: string
  type: string
  icon: string
  online: boolean
  mailCount: number
}

export interface RigMember {
  name: string
  online: boolean
}

export interface Rig {
  name: string
  witness: { online: boolean; mailCount: number }
  refinery: { online: boolean; mqCount: number }
  crew: RigMember[]
  polecats: RigMember[]
}

export interface TownConvoy {
  id: string
  name: string
  status: 'active' | 'completed'
  completed: number
  total: number
}

export interface TownStatus {
  town: {
    name: string
    path: string
  }
  overseer: {
    name: string
    email: string
  }
  townAgents: TownAgent[]
  rigs: Rig[]
  convoys: TownConvoy[]
}

const API_URL = 'http://localhost:3001/api/town/status'
const POLL_INTERVAL = 5000 // Poll every 5 seconds

export function useTownStatus() {
  const [status, setStatus] = useState<TownStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchStatus = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(API_URL, { signal: controller.signal })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to fetch town status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
    }
  }, [fetchStatus])

  return { status, loading, error, refetch: fetchStatus }
}
