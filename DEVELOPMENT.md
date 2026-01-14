# Development Guidelines

This document provides guidelines for developing the gt-admin UI, especially around mock data patterns and component development.

## Important Context

### Gas Town Status

**Gas Town is not stable yet.** The API and data structures may change. Therefore:

1. **Use mock data** - All UI development should use hardcoded mock data
2. **Focus on UI** - Build out the UI components first, backend integration comes later
3. **Keep it flexible** - Design data structures that can easily adapt when the real API is ready

### Reference Repository

This project is based on [shadcn-admin](https://github.com/satnaing/shadcn-admin). The original template lives at:

```
/Users/jasonellington/workspaces/shadcn-admin
```

You can reference this for component patterns and examples.

---

## Mock Data Patterns

### Location

All mock data should live in feature-specific `data/` directories:

```
src/features/<feature>/data/
├── mock-data.ts    # Mock data instances
└── schema.ts       # Zod schemas and TypeScript types
```

### Schema First

Always define Zod schemas before creating mock data:

```typescript
// schema.ts
import { z } from 'zod'

export const agentStatusSchema = z.enum(['online', 'offline', 'working', 'idle', 'stuck'])
export type AgentStatus = z.infer<typeof agentStatusSchema>

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  icon: z.string(),
  status: agentStatusSchema,
  rig: z.string().nullable(),
})
export type Agent = z.infer<typeof agentSchema>
```

### Mock Data Examples

Create realistic mock data that reflects actual Gas Town usage:

```typescript
// mock-data.ts
import type { Agent, Rig, Convoy } from './schema'

export const mockAgents: Agent[] = [
  // Town-level agents
  { id: 'agent-1', name: 'mayor', role: 'mayor', icon: '🎩', status: 'online', rig: null },
  { id: 'agent-2', name: 'deacon', role: 'deacon', icon: '🐺', status: 'working', rig: null },
  { id: 'agent-3', name: 'boot', role: 'dog', icon: '🐕', status: 'idle', rig: null },

  // Rig-level agents (per rig)
  { id: 'agent-4', name: 'witness', role: 'witness', icon: '🦉', status: 'online', rig: 'gastown' },
  { id: 'agent-5', name: 'refinery', role: 'refinery', icon: '🏭', status: 'working', rig: 'gastown' },
]

export const mockRigs: Rig[] = [
  { id: 'rig-1', name: 'gastown', path: '~/gt/gastown', polecatCount: 5, crewCount: 6 },
  { id: 'rig-2', name: 'beads', path: '~/gt/beads', polecatCount: 3, crewCount: 4 },
]

export const mockConvoys: Convoy[] = [
  {
    id: 'convoy-1',
    name: 'Add dark mode support',
    status: 'in_progress',
    rig: 'gastown',
    beadCount: 8,
    completedCount: 5,
    startedAt: new Date('2024-01-14T10:00:00'),
  },
]
```

### Realistic Data Guidelines

When creating mock data, make it realistic:

1. **Use actual Gas Town names**: `mayor`, `deacon`, `witness`, `refinery`, etc.
2. **Use correct icons**: 🎩 Mayor, 🐺 Deacon, 🦉 Witness, 🏭 Refinery, 😺 Polecats, 🐶 Dogs, 👷 Crew
3. **Mix statuses**: Have some agents online, some offline, some working
4. **Include multiple rigs**: Show how the UI handles multiple projects
5. **Show convoy progress**: Convoys should have partial completion for realistic dashboards

---

## Component Patterns

### Feature Structure

Each feature should follow this structure:

```
src/features/<feature>/
├── index.tsx           # Main feature component (page)
├── components/         # Feature-specific components
│   ├── feature-card.tsx
│   └── feature-list.tsx
├── hooks/              # Feature-specific hooks
│   └── use-feature.ts
└── data/               # Mock data and schemas
    ├── mock-data.ts
    └── schema.ts
```

### Using shadcn Components

Prefer existing shadcn components from `src/components/ui/`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
```

### Data Tables

Use the data-table components for list views:

```typescript
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
```

See `src/features/beads/index.tsx` for a working example.

### Status Badges

Create consistent status badges across features:

```typescript
const statusColors: Record<AgentStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  working: 'bg-blue-500',
  idle: 'bg-yellow-500',
  stuck: 'bg-red-500',
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <Badge variant="outline" className={statusColors[status]}>
      {status}
    </Badge>
  )
}
```

---

## API Integration (Future)

When Gas Town stabilizes, we'll add API integration. Plan for this by:

### Hooks Pattern

Create hooks that can easily swap mock data for API calls:

```typescript
// Current (mock data)
export function useAgents() {
  return { data: mockAgents, isLoading: false, error: null }
}

// Future (API)
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => fetch('/api/agents').then(r => r.json()),
  })
}
```

### Environment Toggle

Consider adding an environment variable to switch between mock and real data:

```typescript
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export function useAgents() {
  if (USE_MOCK_DATA) {
    return { data: mockAgents, isLoading: false, error: null }
  }
  return useQuery({ queryKey: ['agents'], queryFn: fetchAgents })
}
```

---

## Common Tasks

### Adding a New Feature

1. Create the feature directory structure
2. Define schemas in `data/schema.ts`
3. Create mock data in `data/mock-data.ts`
4. Build the main component in `index.tsx`
5. Add the route in `src/routes/`
6. Add navigation in sidebar

### Adding a New Agent Role

1. Update `agentRoleSchema` in schema.ts
2. Add icon mapping
3. Add to mock data
4. Update any role-specific UI components

### Adding a New Status

1. Update the relevant status schema
2. Add color mapping for badges
3. Update mock data to include new status examples

---

## Testing

Currently no tests are set up. When adding tests:

1. Use Vitest (already in Vite ecosystem)
2. Test components with React Testing Library
3. Mock the data hooks for isolated component testing
