import type { Town, Rig, Agent, CrewMember, Convoy } from './schema'

export const mockTown: Town = {
  name: 'gt',
  path: '/Users/jasonellington/gt',
  overseer: {
    name: 'Jason Ellington',
    icon: '👤',
  },
}

export const mockRigs: Rig[] = [
  {
    id: 'rig-1',
    name: 'gt_admin',
    polecatCount: 0,
    crewCount: 2,
    agents: ['refinery', 'witness', 'mayor'],
  },
]

export const mockAgents: Agent[] = [
  // Town-level agents
  {
    id: 'agent-1',
    name: 'mayor',
    role: 'mayor',
    icon: '🎩',
    status: 'online',
    rig: null,
  },
  {
    id: 'agent-2',
    name: 'deacon',
    role: 'deacon',
    icon: '🐺',
    status: 'offline',
    rig: null,
  },
  // Rig-level agents (gt_admin)
  {
    id: 'agent-3',
    name: 'witness',
    role: 'witness',
    icon: '🦉',
    status: 'offline',
    rig: 'gt_admin',
  },
  {
    id: 'agent-4',
    name: 'refinery',
    role: 'refinery',
    icon: '🏭',
    status: 'offline',
    rig: 'gt_admin',
  },
]

export const mockCrew: CrewMember[] = [
  {
    id: 'crew-1',
    name: 'jason',
    status: 'offline',
  },
]

export const mockConvoys: Convoy[] = []
