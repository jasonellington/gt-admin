# GT Admin - Gas Town Web UI

A web-based admin dashboard for [Gas Town](https://github.com/steveyegge/gastown), Steve Yegge's multi-agent orchestrator for Claude Code.

> **Status**: Early development. Gas Town itself is not stable yet, so this UI uses mock data. The backend integration will be added once Gas Town stabilizes.

## What is Gas Town?

Gas Town is a Go-based orchestrator that enables developers to manage 20-30+ parallel Claude Code instances productively. It coordinates seven distinct agent roles (Mayor, Deacon, Witness, Refinery, Polecats, Dogs, Crew) across multiple project "rigs" to swarm work, manage merge queues, and maintain durable workflows.

For detailed concepts, see [GASTOWN.md](./GASTOWN.md).

## Project Purpose

This repo provides a modern web UI for Gas Town to:
- Monitor town status, rigs, and agents
- View and manage convoys (work orders)
- Track beads (issues) and merge queues
- Interact with crew members
- View activity feeds in real-time

## Tech Stack

Built on [shadcn-admin](https://github.com/satnaing/shadcn-admin):

- **UI**: [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router/latest)
- **Type Checking**: [TypeScript](https://www.typescriptlang.org/)
- **Tables**: [TanStack Table](https://tanstack.com/table/latest)
- **Icons**: [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons)

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Run Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── data-table/     # Table components
│   └── layout/         # App layout components
├── features/           # Feature modules
│   ├── town-dashboard/ # Main dashboard
│   ├── agents/         # Agents list/detail
│   ├── beads/          # Beads (issues) management
│   ├── convoys/        # Convoy tracking
│   ├── crews/          # Crew management
│   └── mayor/          # Mayor interface
├── lib/                # Utilities
└── routes/             # TanStack Router routes
```

## Documentation

- [GASTOWN.md](./GASTOWN.md) - Gas Town concepts and terminology
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines and mock data patterns
- [CLAUDE.md](./CLAUDE.md) - Instructions for Claude agents working on this repo

## Contributing

This project is in early development. Contributions welcome!

## References

- [Gas Town GitHub](https://github.com/steveyegge/gastown)
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Gas Town Emergency User Manual](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b)
- [shadcn-admin template](https://github.com/satnaing/shadcn-admin)

## License

MIT
