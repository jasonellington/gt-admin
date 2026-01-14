import { createFileRoute } from '@tanstack/react-router'
import { CrewChat } from '@/features/crew-chat'

export const Route = createFileRoute('/_authenticated/rigs/$rigId/crew/$crewId')(
  {
    component: CrewChatPage,
  }
)

function CrewChatPage() {
  const { rigId, crewId } = Route.useParams()
  return <CrewChat rigId={rigId} crewId={crewId} />
}
