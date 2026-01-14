import { useState, useEffect, useCallback, useRef } from 'react'

export interface MergeQueueItem {
  id: string
  rig: string
  source: string
  target: string
  status: 'pending' | 'in_progress' | 'blocked' | 'merged' | 'failed'
  priority: number
  createdAt: string
  createdBy?: string
  title?: string
}

const API_BASE = 'http://localhost:3001'
const POLL_INTERVAL = 5000

export function useMergeQueue() {
  const [items, setItems] = useState<MergeQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMergeQueue = useCallback(async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // First get list of rigs
      const statusResponse = await fetch(`${API_BASE}/api/town/status`, {
        signal: controller.signal,
      })
      if (!statusResponse.ok) throw new Error('Failed to fetch town status')
      const status = await statusResponse.json()

      // Fetch merge queue for each rig
      const rigNames = status.rigs.map((r: { name: string }) => r.name)
      const mqPromises = rigNames.map(async (rigName: string) => {
        try {
          const mqResponse = await fetch(`${API_BASE}/api/rigs/${rigName}/mq`, {
            signal: controller.signal,
          })
          if (!mqResponse.ok) return []
          const mqItems = await mqResponse.json()
          // Add rig name to each item
          return mqItems.map((item: Omit<MergeQueueItem, 'rig'>) => ({
            ...item,
            rig: rigName,
          }))
        } catch {
          return []
        }
      })

      const allMqItems = await Promise.all(mqPromises)
      const flattenedItems = allMqItems.flat() as MergeQueueItem[]

      // Sort by priority (higher first) then by createdAt (older first)
      flattenedItems.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      setItems(flattenedItems)
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError('Failed to fetch merge queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMergeQueue()
    const interval = setInterval(fetchMergeQueue, POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      abortControllerRef.current?.abort()
    }
  }, [fetchMergeQueue])

  return { items, loading, error, refetch: fetchMergeQueue }
}
