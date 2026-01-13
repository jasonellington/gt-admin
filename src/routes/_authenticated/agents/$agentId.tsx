import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AgentDetail } from '@/features/agent-detail'

const searchSchema = z.object({
  from: z.enum(['convoy', 'dashboard']).optional(),
  convoyId: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/agents/$agentId')({
  validateSearch: searchSchema,
  component: AgentDetailPage,
})

function AgentDetailPage() {
  const { agentId } = Route.useParams()
  const { from, convoyId } = Route.useSearch()
  return <AgentDetail agentId={agentId} from={from} convoyId={convoyId} />
}
