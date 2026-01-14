# Gas Town Concepts

This document explains the core concepts of Gas Town for developers building the gt-admin UI. Gas Town is Steve Yegge's multi-agent orchestrator for managing 20-30+ parallel Claude Code instances.

> **Important**: Gas Town is under active development and not yet stable. This UI should use mock data for now and will be wired up to the actual Gas Town backend later.

## References

- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) - Introduction blog post
- [Gas Town Emergency User Manual](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b) - User manual
- [Gas Town GitHub](https://github.com/steveyegge/gastown) - Source code

---

## Core Architecture

### The Town

The **Town** is your headquarters - the root directory where Gas Town manages all your projects. Example: `~/gt`. The town contains:
- Configuration for the orchestrator
- All project rigs as subdirectories
- Town-level agents (Mayor, Deacon, Dogs)

### Rigs

A **Rig** is a single project (git repo) under Gas Town management. Each rig has:
- Its own set of workers (Witness, Refinery, Polecats, Crew)
- A Beads database for issue tracking
- An activity feed showing work progress

Example rigs: `gastown`, `beads`, `wyvern`, `efrit`

### The Overseer

That's the **human user**. The Overseer has an identity in the system, their own inbox, and can send/receive mail to all agents. The Overseer is "the eighth role."

---

## Agent Roles

Gas Town has **seven distinct agent roles** plus the human Overseer:

### Town-Level Agents

| Role | Icon | Description |
|------|------|-------------|
| **Mayor** | 🎩 | Main concierge and chief-of-staff. Primary agent you interact with. Kicks off work convoys and receives notifications when they finish. |
| **Deacon** | 🐺 | The "daemon beacon" - runs patrol loops to keep Gas Town running. Pings other workers, runs town-level plugins, handles session recycling. Named after Dennis Hopper's Waterworld character. |
| **Dogs** | 🐶 | The Deacon's personal crew. Handles maintenance tasks (cleaning stale branches), handyman work, and running plugins. Keeps Deacon focused on its patrol. |
| **Boot** | 🐕 | Special Dog awakened every 5 minutes just to check on the Deacon. Decides if Deacon needs a nudge, restart, or to be left alone. |

### Rig-Level Agents

| Role | Icon | Description |
|------|------|-------------|
| **Witness** | 🦉 | Team lead/supervisor. Monitors polecat health, helps stuck workers, runs rig-level plugins. Ensures work keeps flowing. |
| **Refinery** | 🏭 | CI/CD engineer. Manages the Merge Queue (MQ), intelligently merges all changes one at a time to main. Handles rebasing and conflict resolution. |
| **Polecats** | 😺 | Ephemeral workers that spin up on demand. Work in swarms to produce Merge Requests (MRs). Self-destruct after completing work. Names are recycled. |
| **Crew** | 👷 | Named, long-lived agents working for the Overseer. Great for design work, code reviews, and back-and-forth discussions. You choose their names. |

---

## Work Concepts

### Beads

**Beads** are the atomic unit of work - a lightweight, git-backed issue tracking system. Each bead is:
- A JSON object stored one issue per line
- Tracked in git alongside your project
- Has an ID, description, status, assignee, etc.

Beads serve as the universal data plane for everything in Gas Town.

### Molecules

**Molecules** are workflows - chains of Beads that define multi-step processes. They:
- Survive agent crashes and restarts
- Can have complex shapes, loops, and gates
- Are Turing-complete
- Enable durable, resumable workflows

### Protomolecules

**Protomolecules** are templates for molecules - like classes you instantiate. Example: a 20-step release process template that you can run for any release.

### Formulas

**Formulas** are TOML-format source definitions for workflows that get "cooked" into protomolecules.

### Wisps

**Wisps** are ephemeral (non-persisted) Beads used for orchestration workflows. They get "burned" after completion to avoid cluttering git history.

### Convoys

**Convoys** are Gas Town's work-order system. Every unit of slung work gets wrapped in a Convoy for tracking:
- Single polecat tasks
- Large swarms
- Feature implementations
- Bug fix batches

Convoys show up in dashboards with expanding trees showing tracked issues.

---

## Key Operations

### GUPP (Gastown Universal Propulsion Principle)

> "If there is work on your hook, YOU MUST RUN IT."

GUPP keeps Gas Town moving. Every worker has a persistent **hook** where molecules are hung. When a session starts, the agent checks its hook and continues working automatically.

### Slinging Work

`gt sling` is the fundamental primitive for moving work around. You sling beads to workers, and they start working immediately.

### Handoffs

`gt handoff` gracefully ends a session and restarts it. The new session picks up where the old one left off via GUPP.

### Patrols

**Patrols** are looping workflows for Witness, Refinery, and Deacon. They run continuously with exponential backoff when idle.

### Mail & Messaging

Agents can send mail to each other via Beads. The Overseer has their own inbox too.

---

## Status Values

### Agent Status
- `online` - Agent is running and responsive
- `offline` - Agent is not running
- `working` - Agent is actively processing a task
- `idle` - Agent is online but waiting for work
- `stuck` - Agent needs help/intervention

### Convoy Status
- `pending` - Convoy created but not started
- `in_progress` - Work is being done
- `merging` - Work complete, in merge queue
- `completed` - All work landed successfully
- `failed` - Convoy encountered errors
- `escalated` - Needs human attention

### Bead Status
- `open` - Work not started
- `in_progress` - Being worked on
- `review` - Ready for review
- `done` - Completed
- `blocked` - Cannot proceed
- `escalated` - Needs human help

---

## UI Pages Needed

Based on Gas Town's architecture, the admin UI should include:

### Dashboard
- Town overview (name, path, overseer)
- Quick status of all rigs
- Active convoys count
- Agent status summary

### Rigs
- List of all rigs
- Per-rig: polecat count, crew count, active agents
- Rig detail view with activity feed

### Agents
- All agents across town (town-level and rig-level)
- Filter by role, status, rig
- Agent detail with current task, hook status

### Crew
- Named crew members per rig
- Crew status and current work
- Chat/interaction interface

### Convoys
- Active convoys with status
- Convoy detail with tracked issues
- Historical/completed convoys

### Beads
- Issue list with filtering
- Bead detail view
- Create/edit beads (future)

### Merge Queue
- Queue status per rig
- Items waiting to merge
- Merge history

### Activity Feed
- Real-time activity across town
- Filter by rig, agent, convoy
