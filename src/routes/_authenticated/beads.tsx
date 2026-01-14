import { createFileRoute } from '@tanstack/react-router'
import { BeadsPage } from '@/features/beads'

export const Route = createFileRoute('/_authenticated/beads')({
  component: BeadsPage,
})
