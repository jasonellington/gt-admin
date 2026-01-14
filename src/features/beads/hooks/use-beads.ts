import { useState, useEffect, useCallback, useRef } from 'react'

export interface Bead {
  id: string
  title: string
  type: string
  status: string
  priority: number
  assignee: string | null
  createdAt: string
}

const API_URL = 'http://localhost:3001/api/beads'
const POLL_INTERVAL = 5000

export function useBeads() {
  const [beads, setBeads] = useState<Bead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchBeads = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(API_URL, { signal: controller.signal })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setBeads(data)
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to fetch beads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBeads()
    const interval = setInterval(fetchBeads, POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
    }
  }, [fetchBeads])

  return { beads, loading, error, refetch: fetchBeads }
}
