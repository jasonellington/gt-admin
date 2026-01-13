import { useState, useEffect, useCallback, useRef } from 'react'

export interface Convoy {
  id: string
  name: string
  status: 'active' | 'completed'
  issueCount: number
  completedCount: number
}

export interface ConvoyDetail {
  id: string
  name: string
  status: string
  issues: Array<{ id: string; title: string; status: string; assignee: string | null }>
  completed: number
  total: number
}

const API_URL = 'http://localhost:3001/api/convoys'
const POLL_INTERVAL = 10000 // Poll every 10 seconds

export function useConvoys() {
  const [convoys, setConvoys] = useState<Convoy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchConvoys = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(API_URL, { signal: controller.signal })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setConvoys(data)
      setError(null)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to fetch convoys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConvoys()
    const interval = setInterval(fetchConvoys, POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
    }
  }, [fetchConvoys])

  const createConvoy = useCallback(async (name: string, issues: string[]) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, issues }),
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create convoy')
    }
    const result = await response.json()
    await fetchConvoys() // Refresh list
    return result
  }, [fetchConvoys])

  return { convoys, loading, error, refetch: fetchConvoys, createConvoy }
}

export function useConvoyDetail(convoyId: string | null) {
  const [convoy, setConvoy] = useState<ConvoyDetail | null>(null)
  const [loading, setLoading] = useState(!!convoyId)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchConvoy = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort()

    if (!convoyId) {
      setConvoy(null)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setConvoy(null) // Clear stale data when fetching new convoy
    setError(null)

    try {
      const response = await fetch(`${API_URL}/${convoyId}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setConvoy(data)
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to fetch convoy details')
    } finally {
      setLoading(false)
    }
  }, [convoyId])

  useEffect(() => {
    fetchConvoy()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchConvoy])

  return { convoy, loading, error, refetch: fetchConvoy }
}
