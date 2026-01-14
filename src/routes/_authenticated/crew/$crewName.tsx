import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { CrewChat } from '@/features/crew-chat'

const searchSchema = z.object({
  rig: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/crew/$crewName')({
  validateSearch: searchSchema,
  component: CrewChatPage,
})

function CrewChatPage() {
  const { crewName } = Route.useParams()
  const { rig } = Route.useSearch()
  return <CrewChat crewName={crewName} rigName={rig} />
}
