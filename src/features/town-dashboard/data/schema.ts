import { z } from 'zod'

// Agent status
export const agentStatusSchema = z.enum(['online', 'offline'])
export type AgentStatus = z.infer<typeof agentStatusSchema>

// Agent roles
export const agentRoleSchema = z.enum(['mayor', 'deacon', 'witness', 'refinery'])
export type AgentRole = z.infer<typeof agentRoleSchema>

// Agent schema
export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  icon: z.string(),
  status: agentStatusSchema,
  rig: z.string().nullable(),
})
export type Agent = z.infer<typeof agentSchema>

// Crew member schema
export const crewMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: agentStatusSchema,
})
export type CrewMember = z.infer<typeof crewMemberSchema>

// Rig schema
export const rigSchema = z.object({
  id: z.string(),
  name: z.string(),
  polecatCount: z.number(),
  crewCount: z.number(),
  agents: z.array(z.string()),
})
export type Rig = z.infer<typeof rigSchema>

// Convoy schema
export const convoySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  issues: z.array(z.string()),
})
export type Convoy = z.infer<typeof convoySchema>

// Town overview
export const townSchema = z.object({
  name: z.string(),
  path: z.string(),
  overseer: z.object({
    name: z.string(),
    icon: z.string(),
  }),
})
export type Town = z.infer<typeof townSchema>
