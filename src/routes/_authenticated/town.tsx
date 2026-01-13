import { createFileRoute } from '@tanstack/react-router'
import { TownDashboard } from '@/features/town-dashboard'

export const Route = createFileRoute('/_authenticated/town')({
  component: TownDashboard,
})
