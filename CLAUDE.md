# Instructions for Claude Agents

This file provides guidance for Claude agents working on the gt-admin codebase.

## Project Overview

**gt-admin** is a web UI for [Gas Town](https://github.com/steveyegge/gastown), a multi-agent orchestrator for Claude Code.

### Critical Context

1. **Gas Town is NOT stable** - The backend is under heavy development and changes frequently
2. **Use mock data** - Do NOT attempt to wire up real API calls yet
3. **Focus on UI** - Build beautiful, functional UI components with hardcoded data
4. **Backend integration comes later** - Jason will handle hooking up the real Gas Town API

## Before You Start

Read these files to understand the domain:

1. **[GASTOWN.md](./GASTOWN.md)** - Explains all Gas Town concepts (agents, rigs, beads, convoys, etc.)
2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development patterns and mock data guidelines

## Key Concepts Quick Reference

| Concept | Description |
|---------|-------------|
| **Town** | Root workspace containing all projects |
| **Rig** | A single project/repo under Gas Town management |
| **Mayor** | 🎩 Main agent you talk to, kicks off convoys |
| **Deacon** | 🐺 Daemon that keeps Gas Town running |
| **Witness** | 🦉 Per-rig supervisor monitoring polecats |
| **Refinery** | 🏭 Per-rig merge queue manager |
| **Polecats** | 😺 Ephemeral workers that swarm tasks |
| **Dogs** | 🐶 Deacon's helper crew |
| **Crew** | 👷 Named, long-lived agents for design work |
| **Beads** | Issues/tasks stored in git-backed JSON |
| **Convoy** | A work order wrapping related beads |
| **Molecule** | A workflow chain of beads |
| **GUPP** | "If work is on your hook, you must run it" |

## Tech Stack

- **React 18** with TypeScript
- **Vite** for builds
- **TanStack Router** for routing
- **TanStack Table** for data tables
- **shadcn/ui** components (Tailwind + Radix)
- **Zod** for schema validation
- **Lucide** and **Tabler** icons

## Code Patterns

### Feature Structure

```
src/features/<feature>/
├── index.tsx           # Main page component
├── components/         # Feature components
├── hooks/              # Custom hooks
└── data/
    ├── schema.ts       # Zod schemas + types
    └── mock-data.ts    # Hardcoded test data
```

### Creating Mock Data

Always define schemas first, then create mock data:

```typescript
// data/schema.ts
import { z } from 'zod'

export const beadSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['open', 'in_progress', 'done', 'blocked']),
  assignee: z.string().nullable(),
  rig: z.string(),
})
export type Bead = z.infer<typeof beadSchema>
```

```typescript
// data/mock-data.ts
import type { Bead } from './schema'

export const mockBeads: Bead[] = [
  { id: 'bd-a1b2c', title: 'Fix navigation bug', status: 'in_progress', assignee: 'polecat-3', rig: 'gastown' },
  { id: 'bd-d3e4f', title: 'Add dark mode', status: 'open', assignee: null, rig: 'gastown' },
]
```

### Using Components

Import from the component library:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
```

### Status Colors

Use consistent colors for statuses:

```typescript
// Agent status
const agentStatusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  working: 'bg-blue-500',
  idle: 'bg-yellow-500',
  stuck: 'bg-red-500',
}

// Convoy status
const convoyStatusColors = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  merging: 'bg-purple-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
}
```

## Reference Implementation

The original shadcn-admin template is at:
```
/Users/jasonellington/workspaces/shadcn-admin
```

Use it for reference on:
- Component patterns
- Layout structures
- Table implementations
- Form patterns

## Do's and Don'ts

### Do

- Use existing shadcn/ui components
- Create realistic mock data
- Follow the feature directory structure
- Use Zod schemas for type safety
- Reference GASTOWN.md for domain concepts
- Keep components focused and reusable

### Don't

- Try to connect to a real Gas Town API (not ready yet)
- Create overly complex abstractions
- Add unnecessary dependencies
- Deviate from the established patterns
- Forget to add new routes to the sidebar

## Common Tasks

### Add a New Page

1. Create feature directory: `src/features/<name>/`
2. Add schemas and mock data
3. Create the main component
4. Add route in `src/routes/`
5. Add to sidebar in `src/components/layout/data/sidebar-data.ts`

### Add a New Agent Role

1. Update schema in `src/features/town-dashboard/data/schema.ts`
2. Add icon mapping
3. Add mock data examples
4. Update any role-specific displays

### Create a Data Table

See `src/features/beads/index.tsx` for a complete example using TanStack Table.

## Questions?

If domain concepts are unclear, refer to:
- [GASTOWN.md](./GASTOWN.md) in this repo
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Gas Town User Manual](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b)
