import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AgentStatusBadge } from './agent-status-badge'
import type { Agent, CrewMember } from '../data/schema'

interface AgentListProps {
  agents: Agent[]
  crew: CrewMember[]
}

export function AgentList({ agents, crew }: AgentListProps) {
  const townAgents = agents.filter((a) => a.rig === null)
  const rigAgents = agents.filter((a) => a.rig !== null)

  // Group rig agents by rig
  const rigAgentsByRig = rigAgents.reduce(
    (acc, agent) => {
      const rig = agent.rig!
      if (!acc[rig]) acc[rig] = []
      acc[rig].push(agent)
      return acc
    },
    {} as Record<string, Agent[]>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
        <CardDescription>Worker processes across the town</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Town Agents */}
        <div className='space-y-3'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Town Agents
          </h4>
          <div className='space-y-2'>
            {townAgents.map((agent) => (
              <AgentRow key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* Rig Agents */}
        {Object.entries(rigAgentsByRig).map(([rig, rigAgentList]) => (
          <div key={rig} className='space-y-3'>
            <h4 className='text-sm font-medium text-muted-foreground'>
              {rig}
            </h4>
            <div className='space-y-2'>
              {rigAgentList.map((agent) => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        ))}

        {/* Crew */}
        {crew.length > 0 && (
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-muted-foreground'>Crew</h4>
            <div className='space-y-2'>
              {crew.map((member) => (
                <Link
                  key={member.id}
                  to='/agents/$agentId'
                  params={{ agentId: member.id }}
                  className='flex items-center justify-between gap-4 rounded-md p-2 -mx-2 transition-colors hover:bg-muted'
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-xl'>👷</span>
                    <span className='text-sm font-medium'>{member.name}</span>
                  </div>
                  <AgentStatusBadge status={member.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AgentRow({ agent }: { agent: Agent }) {
  return (
    <Link
      to='/agents/$agentId'
      params={{ agentId: agent.id }}
      className='flex items-center justify-between gap-4 rounded-md p-2 -mx-2 transition-colors hover:bg-muted'
    >
      <div className='flex items-center gap-3'>
        <span className='text-xl'>{agent.icon}</span>
        <div>
          <p className='text-sm font-medium'>{agent.name}</p>
          <p className='text-xs text-muted-foreground'>{agent.role}</p>
        </div>
      </div>
      <AgentStatusBadge status={agent.status} />
    </Link>
  )
}
