import { createFileRoute } from '@tanstack/react-router'
import { AgentView } from '@/features/agent-view'

export const Route = createFileRoute('/_authenticated/agent-view')({
  component: AgentView,
})
