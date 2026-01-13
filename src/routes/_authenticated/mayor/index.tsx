import { createFileRoute } from '@tanstack/react-router'
import { Mayor } from '@/features/mayor'

export const Route = createFileRoute('/_authenticated/mayor/')({
  component: Mayor,
})
