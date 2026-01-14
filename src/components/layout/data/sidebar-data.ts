import {
  Truck,
  Crown,
  Dog,
  LayoutDashboard,
  Cog,
  Command,
  Users,
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
      title: 'Town',
      items: [
        {
          title: 'Dashboard',
          url: '/town',
          icon: LayoutDashboard,
        },
        {
          title: 'Agents',
          url: '/agents',
          icon: Users,
        },
        {
          title: 'Mayor',
          url: '/mayor',
          icon: Crown,
        },
        {
          title: 'Deacon',
          url: '/agents/deacon',
          icon: Dog,
        },
      ],
    },
    {
      title: 'Rigs',
      items: [
        {
          title: 'gt_admin',
          icon: Cog,
          items: [
            {
              title: 'Overview',
              url: '/rigs/gt_admin',
            },
            {
              title: 'Witness',
              url: '/agents/witness',
            },
            {
              title: 'Refinery',
              url: '/agents/refinery',
            },
            {
              title: 'Crew',
              url: '/rigs/gt_admin/crew/marty',
              icon: Users,
            },
          ],
        },
      ],
    },
    {
      title: 'Convoys',
      items: [
        {
          title: 'Active Convoys',
          url: '/convoys',
          icon: Truck,
        },
      ],
    },
  ],
}
