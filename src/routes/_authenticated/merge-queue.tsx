import { createFileRoute } from '@tanstack/react-router'
import { MergeQueue } from '@/features/merge-queue'

export const Route = createFileRoute('/_authenticated/merge-queue')({
  component: MergeQueue,
})
