import { createFileRoute } from '@tanstack/react-router'
import { CrewsPage } from '@/features/crews'

export const Route = createFileRoute('/_authenticated/crew')({
  component: CrewsPage,
})
