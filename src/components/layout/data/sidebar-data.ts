import {
  Building2,
  Truck,
  Bot,
  Crown,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Jason',
    email: 'jason@gastown.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Gas Town',
      logo: Command,
      plan: 'Multi-Agent Workspace',
    },
  ],
  navGroups: [
    {
      title: 'Gas Town',
      items: [
        {
          title: 'Dashboard',
          url: '/town',
          icon: Building2,
        },
        {
          title: 'Convoys',
          url: '/convoys',
          icon: Truck,
        },
        {
          title: 'Agents',
          url: '/agents/mayor',
          icon: Bot,
        },
        {
          title: 'Mayor',
          url: '/mayor',
          icon: Crown,
        },
      ],
    },
  ],
}
