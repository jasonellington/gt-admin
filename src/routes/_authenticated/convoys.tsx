import { createFileRoute } from '@tanstack/react-router'
import { ConvoysPage } from '@/features/convoys'

export const Route = createFileRoute('/_authenticated/convoys')({
  component: ConvoysPage,
})
