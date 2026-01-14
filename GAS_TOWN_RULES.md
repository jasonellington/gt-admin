# Gas Town Domain Model

This document defines the Gas Town architecture, terminology, and workflows. All agents working on this codebase must understand these concepts to build the UI correctly.

> **Origin**: Named after Mad Max's Gas Town - "a ridiculously chaotic environment at first, where it felt like everyone was fighting to get their work done."

## 1. Hierarchy: Town vs Rig

Gas Town uses a two-level hierarchy:

```
TOWN LEVEL (~/gt/)
├── Mayor            ← Global coordinator (singleton)
├── Deacon           ← Background supervisor daemon (singleton)
├── Dogs             ← Infrastructure helpers (Boot, etc.)
└── Rigs/            ← Project containers
    ├── project-a/
    ├── project-b/
    └── ...

RIG LEVEL (~/gt/<rig>/)
├── Witness          ← Worker lifecycle manager (one per rig)
├── Refinery         ← Merge queue processor (one per rig)
├── Crew/            ← Persistent human workspaces
│   └── jason/       ← Individual crew member clone
└── Polecats/        ← Ephemeral worker pool
    ├── wolf/
    └── fox/
```

### Town-Level vs Rig-Level Responsibilities

| Level | Scope | Persistence | Purpose |
|-------|-------|-------------|---------|
| Town | Cross-rig coordination | Persistent | Strategy, orchestration, system health |
| Rig | Single project | Mixed | Development, testing, merging |

## 2. Roles

### Town-Level Roles

#### Mayor (Coordinator)
- **What**: Your primary interface - a Claude Code instance with full workspace context
- **Purpose**: Breaks goals into tasks, orchestrates agents, coordinates cross-rig work
- **Location**: `~/gt/mayor/`
- **Persistence**: Singleton, persistent
- **When to use**: Describe what you want to build; Mayor analyzes and delegates

#### Deacon (Supervisor Daemon)
- **What**: Background watchdog running continuous patrol cycles
- **Purpose**: System health, agent lifecycle, spawning Dogs
- **Persistence**: Singleton, persistent
- **Key behavior**: Monitors the entire Gas Town infrastructure

#### Dogs (Infrastructure Helpers)
- **What**: Maintenance workers for narrow infrastructure tasks
- **Purpose**: Health checks, log rotation, background tasks
- **Key distinction**: Dogs are NOT project workers - never assign feature work to Dogs
- **Special Dog**: **Boot** - monitors the Deacon itself every 5 minutes

### Rig-Level Roles

#### Witness (Worker Monitor)
- **What**: Per-rig supervisor monitoring polecat health
- **Purpose**: Nudge stuck workers, manage lifecycles, escalate issues
- **Location**: `<rig>/witness`
- **Persistence**: One per rig, persistent
- **Key behaviors**:
  - Checks worker progress periodically
  - Verifies clean git state before killing sessions
  - Escalates to Mayor when workers are stuck after 3 nudge attempts

#### Refinery (Merge Queue Processor)
- **What**: Per-rig CI/CD and integration component
- **Purpose**: Process merge requests, resolve conflicts, run quality gates
- **Location**: `<rig>/refinery/`
- **Persistence**: One per rig, persistent
- **Key behaviors**:
  - Manages merge queue
  - Reviews polecat MRs
  - Intelligently integrates changes

#### Crew (Persistent Workers)
- **What**: Human's personal workspace within a rig
- **Purpose**: Exploratory, long-running, or judgment-requiring work
- **Location**: `<rig>/crew/<name>/`
- **Persistence**: Long-lived, human-managed
- **Key distinctions**:
  - Never auto-garbage-collected (unlike polecats)
  - No Witness supervision
  - Own their workspace and git clone
  - Push directly to main (no feature branches)

#### Polecats (Ephemeral Workers)
- **What**: Temporary worker agents that spawn, complete tasks, and disappear
- **Purpose**: Discrete, parallelizable tasks
- **Location**: `<rig>/polecats/<name>/`
- **Persistence**: Ephemeral, Witness-managed
- **Key behaviors**:
  - Single-task focus - one issue at a time
  - Work in temporary worktrees
  - Self-clean via `gt done` when complete
  - Three states: Working, Stalled, Zombie

### Crew vs Polecats Decision Matrix

| Scenario | Use Crew | Use Polecat |
|----------|----------|-------------|
| Exploratory work | Yes | No |
| Requires human judgment | Yes | No |
| Long-running investigation | Yes | No |
| Discrete, well-defined task | No | Yes |
| Parallelizable work | No | Yes |
| Can be supervised automatically | No | Yes |

### The Overseer

The **Overseer** is the human operator - you. The overseer:
- Interacts primarily through the Mayor
- Manages Crew members directly
- Has ultimate authority over the system

## 3. Work Units

### Beads (Atomic Work Units)
- **What**: Git-backed atomic work unit stored in JSONL format
- **Analogy**: Tickets, GitHub issues
- **Key property**: Persistent, trackable, attributable
- **Commands**: `bd ready`, `bd show`, `bd update`, `bd close`, `bd sync`

### Convoys (Work Batches)
- **What**: Grouped work-orders bundling multiple issues
- **Analogy**: Sprints, project batches
- **Purpose**: Track what's in flight, provide cross-rig visibility
- **Key property**: Persist after completion for historical record
- **Commands**: `gt convoy create`, `gt convoy status`

### Hooks (Assignment Queues)
- **What**: Pinned work queue for individual agents
- **Analogy**: Personal inbox, assignment queue
- **Purpose**: Persistent storage for agent work that survives crashes/restarts
- **Key principle**: **GUPP** - If work is on your hook, YOU RUN IT
- **Commands**: `gt hook`, `gt hook attach`, `gt hook detach`

### Molecules (Durable Workflows)
- **What**: Chained bead workflows that survive agent restarts
- **Analogy**: SOPs, runbooks, checklists
- **Key property**: Persistent, resumable across sessions
- **Commands**: `bd mol pour` (create), `bd mol squash` (condense)

### Wisps (Ephemeral Workflows)
- **What**: Temporary beads destroyed after execution
- **Key property**: Only exist in memory, never persist to JSONL
- **Commands**: `bd mol wisp` (create), `bd mol burn` (discard)

### Formulas (Workflow Templates)
- **What**: TOML-defined workflow templates
- **Location**: `.beads/formulas/`
- **Purpose**: Define reusable operation patterns
- **Lifecycle**: Formula → Protomolecule → Molecule/Wisp → Digest

### Work Unit Hierarchy

```
Formula (template)
    ↓ instantiate
Protomolecule (frozen template)
    ↓ pour/wisp
Molecule (persistent) or Wisp (ephemeral)
    ↓ execute steps
Digest (squashed result)
```

## 4. Workflows

### The MEOW Pattern (Molecular Expression of Work)
The recommended workflow for interacting with Gas Town:

1. **Start** the Mayor session
2. **Describe** what you want to build
3. **Mayor analyzes** and creates a convoy with issues
4. **Mayor spawns** appropriate agents (polecats)
5. **Issues distributed** via hooks
6. **Track progress** through convoy status
7. **Mayor summarizes** results

### Slinging (Work Assignment)
```bash
gt sling <issue> <rig>    # Assign work to a rig's workers
```
When you tell the Mayor to "file it and sling it":
1. Mayor files a bead for the problem
2. Mayor slings it to a polecat
3. Polecat works on it immediately (GUPP)

### Handoff (Session Cycling)
When context fills up, agents cycle to fresh sessions:
```bash
gt handoff                           # Simple handoff
gt handoff -s "Subject" -m "Notes"   # With context notes
```
The handoff preserves:
- Pinned molecule (tracked by beads)
- Context notes (optional mail to self)

### Nudging (Real-Time Messaging)
```bash
gt nudge <agent> "message"    # Send real-time message to agent
```
Used by Witness to prompt stuck workers.

### Seance (Query Past Sessions)
Query predecessor sessions for prior decisions and context.

### The Propulsion Principle (GUPP)

**Gas Town Universal Propulsion Principle**: If you find work on your hook, YOU RUN IT.

- No confirmation needed
- No waiting for instructions
- The hook having work IS the assignment
- This is physics, not politeness

```
Agent starts → Check hook → Work found → EXECUTE IMMEDIATELY
                         → No work → Check mail → Wait for assignment
```

### Polecat Lifecycle

```
Spawn → Receive Issue → Work → Test → Commit → gt done → Cleanup
                         ↓
                    If stuck 3x → Witness escalates to Mayor
```

**Three states**:
- **Working**: Actively implementing
- **Stalled**: Session stopped unexpectedly
- **Zombie**: Failed cleanup (system failure)

### Landing the Plane (Session Completion)

Every session must complete these steps:
1. File issues for remaining work
2. Run quality gates (tests, lints, builds)
3. Update issue status
4. **PUSH TO REMOTE** (mandatory)
5. Clean up
6. Hand off context

**Critical**: Work is NOT complete until `git push` succeeds.

## 5. For This UI Project

### UI Should Reflect Town/Rig Hierarchy

The web UI is replacing tmux as the Gas Town interface. Structure should mirror:

```
Town Dashboard
├── Mayor Chat (Primary Interface)
├── System Health (Deacon status)
├── Rig List
│   └── Rig Detail
│       ├── Witness Status
│       ├── Refinery Queue
│       ├── Crew Members
│       └── Active Polecats
└── Convoy Tracker
```

### Mayor Chat is Primary Interface

The Mayor is the user's main interaction point:
- Describe goals in natural language
- Mayor breaks down and delegates
- Mayor reports progress and summarizes results

The UI should make Mayor chat the central, prominent feature.

### Key UI Concepts

| Domain Concept | UI Representation |
|----------------|-------------------|
| Town | Global dashboard/nav |
| Rig | Project tab/page |
| Mayor | Chat interface |
| Convoy | Progress tracker |
| Polecat | Worker card with status |
| Witness | Health indicator |
| Refinery | Merge queue display |
| Hook | Assignment badge |
| Bead | Issue/task card |

### Status Indicators

**Agent States**:
- Polecat: Working (green), Stalled (yellow), Zombie (red)
- Witness: Active (green), Idle (gray)
- Refinery: Processing (blue), Clear (green), Blocked (red)

**Work States**:
- Bead: Open, In Progress, Closed
- Convoy: Active, Complete
- Hook: Empty, Attached

## Key Terminology Quick Reference

| Term | Definition |
|------|------------|
| **MEOW** | Molecular Expression of Work - breaking goals into agent-executable steps |
| **GUPP** | Gas Town Universal Propulsion Principle - execute hooked work immediately |
| **NDI** | Nondeterministic Idempotence - useful outcomes despite unreliable processes |
| **Town** | Central workspace (`~/gt/`) managing all rigs |
| **Rig** | Project-specific repository under Gas Town management |
| **Sling** | Assign work to an agent |
| **Nudge** | Real-time message to an agent |
| **Handoff** | Session cycling with context preservation |
| **Hook** | Persistent work assignment for an agent |
| **Swarm** | Group of polecats assigned to a convoy's issues |

## Sources

- [Gas Town GitHub Repository](https://github.com/steveyegge/gastown)
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) (Steve Yegge, Medium)
- [Gas Town Emergency User Manual](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b) (Steve Yegge, Medium)
- [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c) (Steve Yegge, Medium)
- [Wrapping My Head Around Gas Town](https://justin.abrah.ms/blog/2026-01-05-wrapping-my-head-around-gas-town.html) (Justin Abrahms)
