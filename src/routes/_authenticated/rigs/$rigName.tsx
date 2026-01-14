import { createFileRoute } from '@tanstack/react-router'
import { RigDetail } from '@/features/rig-detail'

export const Route = createFileRoute('/_authenticated/rigs/$rigName')({
  component: RigDetailPage,
})

function RigDetailPage() {
  const { rigName } = Route.useParams()
  return <RigDetail rigName={rigName} />
}
