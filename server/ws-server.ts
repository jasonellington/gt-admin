import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { exec } from 'child_process'
import { parse } from 'url'

const PORT = 3001
const STATUS_POLL_INTERVAL = 2500 // Poll gt status every 2.5 seconds

// Town status interface
interface TownStatus {
  town: {
    name: string
    path: string
  }
  overseer: {
    name: string
    email: string
  }
  townAgents: Array<{
    name: string
    type: string
    icon: string
    online: boolean
    mailCount: number
  }>
  rigs: Array<{
    name: string
    witness: { online: boolean; mailCount: number }
    refinery: { online: boolean; mqCount: number }
    crew: Array<{ name: string; online: boolean }>
    polecats: Array<{ name: string; online: boolean }>
  }>
  convoys: Array<{
    id: string
    name: string
    status: 'active' | 'completed'
    completed: number
    total: number
  }>
}

// ============================================================================
// Real-time Status Broadcasting
// ============================================================================

// Clients subscribed to real-time status updates
const statusSubscribers = new Set<WebSocket>()

// Last known status for diffing
let lastTownStatus: TownStatus | null = null

// Compute diff between two status objects
function computeStatusDiff(
  oldStatus: TownStatus | null,
  newStatus: TownStatus
): StatusChange[] {
  const changes: StatusChange[] = []

  if (!oldStatus) {
    // First status - send everything
    changes.push({ type: 'full', data: newStatus })
    return changes
  }

  // Check town agents
  for (const newAgent of newStatus.townAgents) {
    const oldAgent = oldStatus.townAgents.find((a) => a.name === newAgent.name)
    if (!oldAgent) {
      changes.push({ type: 'agent-added', data: newAgent })
    } else if (oldAgent.online !== newAgent.online) {
      changes.push({
        type: 'agent-state',
        data: { name: newAgent.name, online: newAgent.online, wasOnline: oldAgent.online },
      })
    } else if (oldAgent.mailCount !== newAgent.mailCount) {
      changes.push({
        type: 'agent-mail',
        data: { name: newAgent.name, mailCount: newAgent.mailCount, previousCount: oldAgent.mailCount },
      })
    }
  }

  // Check rigs
  for (const newRig of newStatus.rigs) {
    const oldRig = oldStatus.rigs.find((r) => r.name === newRig.name)
    if (!oldRig) {
      changes.push({ type: 'rig-added', data: newRig })
      continue
    }

    // Witness changes
    if (oldRig.witness.online !== newRig.witness.online) {
      changes.push({
        type: 'witness-state',
        data: { rig: newRig.name, online: newRig.witness.online },
      })
    }
    if (oldRig.witness.mailCount !== newRig.witness.mailCount) {
      changes.push({
        type: 'witness-mail',
        data: { rig: newRig.name, mailCount: newRig.witness.mailCount },
      })
    }

    // Refinery changes
    if (oldRig.refinery.online !== newRig.refinery.online) {
      changes.push({
        type: 'refinery-state',
        data: { rig: newRig.name, online: newRig.refinery.online },
      })
    }
    if (oldRig.refinery.mqCount !== newRig.refinery.mqCount) {
      changes.push({
        type: 'refinery-mq',
        data: { rig: newRig.name, mqCount: newRig.refinery.mqCount, previousCount: oldRig.refinery.mqCount },
      })
    }

    // Polecat changes
    const oldPolecatNames = new Set(oldRig.polecats.map((p) => p.name))
    const newPolecatNames = new Set(newRig.polecats.map((p) => p.name))

    for (const polecat of newRig.polecats) {
      if (!oldPolecatNames.has(polecat.name)) {
        changes.push({
          type: 'polecat-spawned',
          data: { rig: newRig.name, name: polecat.name, online: polecat.online },
        })
      } else {
        const oldPolecat = oldRig.polecats.find((p) => p.name === polecat.name)
        if (oldPolecat && oldPolecat.online !== polecat.online) {
          changes.push({
            type: 'polecat-state',
            data: { rig: newRig.name, name: polecat.name, online: polecat.online },
          })
        }
      }
    }

    for (const oldPolecat of oldRig.polecats) {
      if (!newPolecatNames.has(oldPolecat.name)) {
        changes.push({
          type: 'polecat-completed',
          data: { rig: newRig.name, name: oldPolecat.name },
        })
      }
    }

    // Crew changes
    const oldCrewNames = new Set(oldRig.crew.map((c) => c.name))
    const newCrewNames = new Set(newRig.crew.map((c) => c.name))

    for (const crew of newRig.crew) {
      if (!oldCrewNames.has(crew.name)) {
        changes.push({
          type: 'crew-joined',
          data: { rig: newRig.name, name: crew.name, online: crew.online },
        })
      } else {
        const oldCrew = oldRig.crew.find((c) => c.name === crew.name)
        if (oldCrew && oldCrew.online !== crew.online) {
          changes.push({
            type: 'crew-state',
            data: { rig: newRig.name, name: crew.name, online: crew.online },
          })
        }
      }
    }

    for (const oldCrew of oldRig.crew) {
      if (!newCrewNames.has(oldCrew.name)) {
        changes.push({
          type: 'crew-left',
          data: { rig: newRig.name, name: oldCrew.name },
        })
      }
    }
  }

  // Check convoys
  const oldConvoyIds = new Set(oldStatus.convoys.map((c) => c.id))
  const newConvoyIds = new Set(newStatus.convoys.map((c) => c.id))

  for (const convoy of newStatus.convoys) {
    if (!oldConvoyIds.has(convoy.id)) {
      changes.push({ type: 'convoy-created', data: convoy })
    } else {
      const oldConvoy = oldStatus.convoys.find((c) => c.id === convoy.id)
      if (oldConvoy) {
        if (oldConvoy.completed !== convoy.completed || oldConvoy.total !== convoy.total) {
          changes.push({
            type: 'convoy-progress',
            data: {
              id: convoy.id,
              name: convoy.name,
              completed: convoy.completed,
              total: convoy.total,
              previousCompleted: oldConvoy.completed,
            },
          })
        }
        if (oldConvoy.status !== convoy.status) {
          changes.push({
            type: 'convoy-status',
            data: { id: convoy.id, status: convoy.status, previousStatus: oldConvoy.status },
          })
        }
      }
    }
  }

  for (const oldConvoy of oldStatus.convoys) {
    if (!newConvoyIds.has(oldConvoy.id)) {
      changes.push({ type: 'convoy-removed', data: { id: oldConvoy.id, name: oldConvoy.name } })
    }
  }

  return changes
}

// Broadcast status changes to all subscribers
function broadcastStatusChanges(changes: StatusChange[], fullStatus: TownStatus) {
  if (statusSubscribers.size === 0) return

  const message = JSON.stringify({
    type: 'status-update',
    changes,
    timestamp: Date.now(),
    // Include full status for clients that need it
    fullStatus: changes.some((c) => c.type === 'full') ? fullStatus : undefined,
  })

  Array.from(statusSubscribers).forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  })
}

// Start polling for status updates
let statusPollInterval: NodeJS.Timeout | null = null

async function pollAndBroadcastStatus() {
  try {
    const newStatus = await getTownStatus()
    const changes = computeStatusDiff(lastTownStatus, newStatus)

    if (changes.length > 0) {
      broadcastStatusChanges(changes, newStatus)
    }

    lastTownStatus = newStatus
  } catch (error) {
    console.error('Error polling status:', error)
  }
}

function startStatusPolling() {
  if (statusPollInterval) return
  console.log('Starting real-time status polling...')
  pollAndBroadcastStatus() // Initial poll
  statusPollInterval = setInterval(pollAndBroadcastStatus, STATUS_POLL_INTERVAL)
}

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval)
    statusPollInterval = null
    console.log('Stopped real-time status polling')
  }
}

// Status change types
interface StatusChange {
  type:
    | 'full'
    | 'agent-added'
    | 'agent-state'
    | 'agent-mail'
    | 'rig-added'
    | 'witness-state'
    | 'witness-mail'
    | 'refinery-state'
    | 'refinery-mq'
    | 'polecat-spawned'
    | 'polecat-state'
    | 'polecat-completed'
    | 'crew-joined'
    | 'crew-state'
    | 'crew-left'
    | 'convoy-created'
    | 'convoy-progress'
    | 'convoy-status'
    | 'convoy-removed'
  data: unknown
}

// Known agents to check status for
const KNOWN_AGENTS = [
  { name: 'mayor', type: 'mayor' as const, rig: null, icon: '🎩' },
  { name: 'deacon', type: 'deacon' as const, rig: null, icon: '🐺' },
  { name: 'witness', type: 'witness' as const, rig: 'gt_admin', icon: '🦉' },
  { name: 'refinery', type: 'refinery' as const, rig: 'gt_admin', icon: '🏭' },
]

// Get active polecats
async function getActivePolecats(): Promise<Array<{
  name: string
  rig: string
  tmuxSession: string
  online: boolean
}>> {
  try {
    const output = await runCommand('gt polecat list gt_admin 2>/dev/null || echo ""')
    if (!output || output.includes('No polecats')) return []

    // Parse polecat list output
    const polecats: Array<{ name: string; rig: string; tmuxSession: string; online: boolean }> = []
    const lines = output.split('\n')
    for (const line of lines) {
      const match = line.match(/[●○]\s+(\w+)\/(\w+)/)
      if (match) {
        const [, rig, name] = match
        polecats.push({
          name,
          rig,
          tmuxSession: `gt-${rig}-${name}`,
          online: line.includes('●'),
        })
      }
    }
    return polecats
  } catch {
    return []
  }
}
const POLL_INTERVAL = 500 // ms between tmux captures (higher = less flashing)

// Agent types determine how we manage sessions
type AgentType = 'mayor' | 'deacon' | 'witness' | 'refinery' | 'polecat' | 'crew'

interface ClientState {
  agentName: string
  agentType: AgentType
  rig: string | null
  tmuxSession: string
  lastContent: string
  pollInterval: NodeJS.Timeout | null
}

const clients = new Map<WebSocket, ClientState>()

// Get the tmux session name for an agent
function getTmuxSessionName(agentType: AgentType, agentName: string, rig: string | null): string {
  switch (agentType) {
    case 'mayor':
      return 'hq-mayor'
    case 'deacon':
      return 'hq-deacon'
    case 'witness':
      return rig ? `${rig}-witness` : 'witness'
    case 'refinery':
      return rig ? `${rig}-refinery` : 'refinery'
    case 'polecat':
      // Polecats use gt-<rig>-<name> naming convention
      return rig ? `gt-${rig}-${agentName}` : `gt-${agentName}`
    case 'crew':
      return rig ? `${rig}-${agentName}` : agentName
    default:
      return agentName
  }
}

// Check if tmux session exists
function sessionExists(tmuxSession: string): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`tmux has-session -t "${tmuxSession}" 2>/dev/null`, (error) => {
      resolve(!error)
    })
  })
}

// Get agent status using gt commands
function getAgentStatus(agentType: AgentType, rig: string | null): Promise<{ running: boolean; status: string }> {
  return new Promise((resolve) => {
    let cmd: string
    switch (agentType) {
      case 'mayor':
        cmd = 'gt mayor status'
        break
      case 'deacon':
        cmd = 'gt deacon status'
        break
      case 'witness':
        cmd = rig ? `gt witness status ${rig}` : 'echo "No rig specified"'
        break
      case 'refinery':
        cmd = rig ? `gt refinery status ${rig}` : 'echo "No rig specified"'
        break
      default:
        // For polecats/crew, just check tmux directly
        resolve({ running: false, status: 'unknown' })
        return
    }

    exec(cmd, (error, stdout) => {
      const output = stdout || ''
      const running = output.includes('●') || output.includes('running')
      resolve({ running, status: output.trim() })
    })
  })
}

// Capture tmux pane content
function captureTmux(tmuxSession: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // -e: include escape sequences (colors)
    // -p: print to stdout
    // -S -500: start 500 lines back in history
    // -J: join wrapped lines (prevents artificial line breaks)
    exec(
      `tmux capture-pane -t "${tmuxSession}" -e -p -S -500 -J`,
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      }
    )
  })
}

// Send command to tmux session
function sendToTmux(tmuxSession: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use -l for literal text, then send Enter separately
    // This avoids shell escaping issues with special characters
    const escapedCommand = command.replace(/'/g, "'\\''")
    exec(`tmux send-keys -t '${tmuxSession}' -l '${escapedCommand}' && tmux send-keys -t '${tmuxSession}' Enter`, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

// Start an agent using gt commands
function startAgent(agentType: AgentType, rig: string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    let cmd: string
    switch (agentType) {
      case 'mayor':
        cmd = 'gt mayor start'
        break
      case 'deacon':
        cmd = 'gt deacon start'
        break
      case 'witness':
        cmd = rig ? `gt witness start ${rig}` : ''
        break
      case 'refinery':
        cmd = rig ? `gt refinery start ${rig}` : ''
        break
      default:
        reject(new Error(`Cannot start ${agentType} agents from UI`))
        return
    }

    if (!cmd) {
      reject(new Error('Rig required for this agent type'))
      return
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
      } else {
        resolve(stdout)
      }
    })
  })
}

// Stop an agent using gt commands
function stopAgent(agentType: AgentType, rig: string | null): Promise<string> {
  return new Promise((resolve, reject) => {
    let cmd: string
    switch (agentType) {
      case 'mayor':
        cmd = 'gt mayor stop'
        break
      case 'deacon':
        cmd = 'gt deacon stop'
        break
      case 'witness':
        cmd = rig ? `gt witness stop ${rig}` : ''
        break
      case 'refinery':
        cmd = rig ? `gt refinery stop ${rig}` : ''
        break
      default:
        reject(new Error(`Cannot stop ${agentType} agents from UI`))
        return
    }

    if (!cmd) {
      reject(new Error('Rig required for this agent type'))
      return
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
      } else {
        resolve(stdout)
      }
    })
  })
}

// Start polling for tmux content
function startPolling(ws: WebSocket, state: ClientState) {
  if (state.pollInterval) {
    clearInterval(state.pollInterval)
  }

  let isFirstPoll = true

  const poll = async () => {
    try {
      const content = await captureTmux(state.tmuxSession)

      // Only send if content changed
      if (content !== state.lastContent) {
        if (isFirstPoll) {
          // Send full content on first poll
          ws.send(JSON.stringify({
            type: 'output',
            data: content,
            full: true,
          }))
          isFirstPoll = false
        } else {
          // Send only the new lines (diff)
          const oldLines = state.lastContent.split('\n')
          const newLines = content.split('\n')

          // Find where the content diverges
          let commonPrefix = 0
          while (commonPrefix < oldLines.length &&
                 commonPrefix < newLines.length &&
                 oldLines[commonPrefix] === newLines[commonPrefix]) {
            commonPrefix++
          }

          // Get new content from the divergence point
          const newContent = newLines.slice(commonPrefix).join('\n')

          if (newContent || newLines.length < oldLines.length) {
            ws.send(JSON.stringify({
              type: 'output',
              data: content,
              full: true, // For now, send full to avoid sync issues
            }))
          }
        }
        state.lastContent = content
      }
    } catch (error) {
      // Session might not exist, that's ok
    }
  }

  // Initial capture
  poll()

  // Start polling
  state.pollInterval = setInterval(poll, POLL_INTERVAL)
}

// Stop polling
function stopPolling(state: ClientState) {
  if (state.pollInterval) {
    clearInterval(state.pollInterval)
    state.pollInterval = null
  }
}

// Get all agent statuses
async function getAllAgentStatuses(): Promise<Array<{
  name: string
  type: AgentType
  rig: string | null
  icon: string
  tmuxSession: string
  online: boolean
}>> {
  const results = await Promise.all(
    KNOWN_AGENTS.map(async (agent) => {
      const tmuxSession = getTmuxSessionName(agent.type, agent.name, agent.rig)
      const online = await sessionExists(tmuxSession)
      return {
        ...agent,
        tmuxSession,
        online,
      }
    })
  )
  return results
}

// Run a command and return stdout
function runCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
      } else {
        resolve(stdout)
      }
    })
  })
}

// Get convoy list with details
async function getConvoyList(): Promise<Array<{
  id: string
  name: string
  status: 'active' | 'completed'
  completed: number
  total: number
}>> {
  try {
    const output = await runCommand('gt convoy status --json 2>/dev/null || echo "[]"')
    const trimmed = output.trim()
    if (!trimmed || trimmed === '[]' || trimmed.includes('No convoys')) {
      return []
    }
    const raw = JSON.parse(trimmed) as Array<{ id: string; title: string; status: string }>

    // Fetch details for each convoy to get issue counts
    const convoys = await Promise.all(
      raw.map(async (c) => {
        try {
          const detailOutput = await runCommand(`gt convoy status ${c.id} --json`)
          const detail = JSON.parse(detailOutput.trim()) as {
            tracked: Array<{ status: string }> | null
            completed: number
            total: number
          }
          return {
            id: c.id,
            name: c.title,
            status: c.status === 'open' ? 'active' as const : 'completed' as const,
            total: detail.total || 0,
            completed: detail.completed || 0,
          }
        } catch {
          return {
            id: c.id,
            name: c.title,
            status: c.status === 'open' ? 'active' as const : 'completed' as const,
            total: 0,
            completed: 0,
          }
        }
      })
    )
    return convoys
  } catch {
    return []
  }
}

// Get convoy details
async function getConvoyStatus(convoyId: string): Promise<{
  id: string
  name: string
  status: string
  issues: Array<{ id: string; title: string; status: string; assignee: string | null }>
  completed: number
  total: number
} | null> {
  try {
    const output = await runCommand(`gt convoy status ${convoyId} --json`)
    const raw = JSON.parse(output.trim()) as {
      id: string
      title: string
      status: string
      tracked: Array<{ id: string; title: string; status: string; assignee?: string }> | null
      completed: number
      total: number
    }
    return {
      id: raw.id,
      name: raw.title,
      status: raw.status === 'open' ? 'active' : 'completed',
      issues: (raw.tracked || []).map((i) => ({
        id: i.id,
        title: i.title,
        status: i.status,
        assignee: i.assignee || null,
      })),
      completed: raw.completed,
      total: raw.total,
    }
  } catch {
    return null
  }
}

// Create a convoy
async function createConvoy(name: string, issues: string[]): Promise<{ id: string; message: string }> {
  const issueArgs = issues.join(' ')
  const output = await runCommand(`gt convoy create "${name.replace(/"/g, '\\"')}" ${issueArgs}`)
  // Parse the convoy ID from output
  const match = output.match(/hq-[a-z0-9]+/)
  return {
    id: match?.[0] || 'unknown',
    message: output.trim(),
  }
}

// Get full town status by parsing gt status output
async function getTownStatus(): Promise<TownStatus> {
  const output = await runCommand('gt status 2>/dev/null || echo ""')
  const lines = output.split('\n')

  const result: TownStatus = {
    town: { name: '', path: '' },
    overseer: { name: '', email: '' },
    townAgents: [],
    rigs: [],
    convoys: [],
  }

  let currentRig: TownStatus['rigs'][0] | null = null
  let inCrew = false
  let inPolecats = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Town name (first line like "Town: gt")
    const townMatch = line.match(/^Town:\s*(.+)$/)
    if (townMatch) {
      result.town.name = townMatch[1].trim()
      // Next line is path
      if (i + 1 < lines.length && lines[i + 1].startsWith('/')) {
        result.town.path = lines[i + 1].trim()
      }
      continue
    }

    // Overseer line
    const overseerMatch = line.match(/👤\s*Overseer:\s*(.+?)\s*<(.+?)>/)
    if (overseerMatch) {
      result.overseer.name = overseerMatch[1].trim()
      result.overseer.email = overseerMatch[2].trim()
      continue
    }

    // Town-level agents (mayor, deacon)
    const mayorMatch = line.match(/🎩\s*mayor\s+([●○])\s*(📬(\d+))?/)
    if (mayorMatch) {
      result.townAgents.push({
        name: 'mayor',
        type: 'mayor',
        icon: '🎩',
        online: mayorMatch[1] === '●',
        mailCount: parseInt(mayorMatch[3] || '0', 10),
      })
      continue
    }

    const deaconMatch = line.match(/🐺\s*deacon\s+([●○])\s*(📬(\d+))?/)
    if (deaconMatch) {
      result.townAgents.push({
        name: 'deacon',
        type: 'deacon',
        icon: '🐺',
        online: deaconMatch[1] === '●',
        mailCount: parseInt(deaconMatch[3] || '0', 10),
      })
      continue
    }

    // Rig section header (─── rig_name/ ───)
    const rigMatch = line.match(/^───\s*(\w+)\/\s*───/)
    if (rigMatch) {
      // Save previous rig if exists
      if (currentRig) {
        result.rigs.push(currentRig)
      }
      currentRig = {
        name: rigMatch[1],
        witness: { online: false, mailCount: 0 },
        refinery: { online: false, mqCount: 0 },
        crew: [],
        polecats: [],
      }
      inCrew = false
      inPolecats = false
      continue
    }

    // Within a rig section
    if (currentRig) {
      // Witness
      const witnessMatch = line.match(/🦉\s*witness\s+([●○])\s*(📬(\d+))?/)
      if (witnessMatch) {
        currentRig.witness.online = witnessMatch[1] === '●'
        currentRig.witness.mailCount = parseInt(witnessMatch[3] || '0', 10)
        inCrew = false
        inPolecats = false
        continue
      }

      // Refinery
      const refineryMatch = line.match(/🏭\s*refinery\s+([●○])\s*(MQ:(\d+))?/)
      if (refineryMatch) {
        currentRig.refinery.online = refineryMatch[1] === '●'
        currentRig.refinery.mqCount = parseInt(refineryMatch[3] || '0', 10)
        inCrew = false
        inPolecats = false
        continue
      }

      // Crew section header
      const crewHeaderMatch = line.match(/👷\s*Crew\s*\((\d+)\)/)
      if (crewHeaderMatch) {
        inCrew = true
        inPolecats = false
        continue
      }

      // Polecats section header
      const polecatsHeaderMatch = line.match(/😺\s*Polecats\s*\((\d+)\)/)
      if (polecatsHeaderMatch) {
        inCrew = false
        inPolecats = true
        continue
      }

      // Crew/Polecat member line (indented name with status)
      const memberMatch = line.match(/^\s+(\w+)\s+([●○])/)
      if (memberMatch) {
        const member = {
          name: memberMatch[1],
          online: memberMatch[2] === '●',
        }
        if (inCrew) {
          currentRig.crew.push(member)
        } else if (inPolecats) {
          currentRig.polecats.push(member)
        }
        continue
      }
    }
  }

  // Don't forget the last rig
  if (currentRig) {
    result.rigs.push(currentRig)
  }

  // Also fetch convoys
  result.convoys = await getConvoyList()

  return result
}

// Parse request body
async function parseBody(req: import('http').IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// HTTP server for REST endpoints + WebSocket
const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const { pathname } = parse(req.url || '', true)

  // Agent statuses
  if (pathname === '/api/agents/status' && req.method === 'GET') {
    try {
      const statuses = await getAllAgentStatuses()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(statuses))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to get agent statuses' }))
    }
    return
  }

  // Convoy list
  if (pathname === '/api/convoys' && req.method === 'GET') {
    try {
      const convoys = await getConvoyList()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(convoys))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to get convoys' }))
    }
    return
  }

  // Create convoy
  if (pathname === '/api/convoys' && req.method === 'POST') {
    try {
      const body = await parseBody(req) as { name: string; issues: string[] }
      if (!body.name) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Name is required' }))
        return
      }
      const result = await createConvoy(body.name, body.issues || [])
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: `Failed to create convoy: ${error}` }))
    }
    return
  }

  // Polecats list
  if (pathname === '/api/polecats' && req.method === 'GET') {
    try {
      const polecats = await getActivePolecats()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(polecats))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to get polecats' }))
    }
    return
  }

  // Town status (full overview)
  if (pathname === '/api/town/status' && req.method === 'GET') {
    try {
      const status = await getTownStatus()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(status))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to get town status' }))
    }
    return
  }

  // Convoy detail
  const convoyMatch = pathname?.match(/^\/api\/convoys\/(.+)$/)
  if (convoyMatch && req.method === 'GET') {
    try {
      const convoy = await getConvoyStatus(convoyMatch[1])
      if (convoy) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(convoy))
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Convoy not found' }))
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to get convoy' }))
    }
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

const wss = new WebSocketServer({ server })

server.listen(PORT, () => {
  console.log(`Gas Town server running on http://localhost:${PORT}`)
  console.log(`  Agent Terminal: ws://localhost:${PORT}?agent=<name>&type=<type>&rig=<rig>`)
  console.log(`  Status Stream:  ws://localhost:${PORT}?subscribe=status`)
  console.log(`  REST API:       http://localhost:${PORT}/api/agents/status`)
})

wss.on('connection', async (ws, req) => {
  const { query } = parse(req.url || '', true)
  const subscribe = query.subscribe as string

  // Handle real-time status subscriptions
  if (subscribe === 'status') {
    console.log('Status subscriber connected')
    statusSubscribers.add(ws)

    // Start polling if this is the first subscriber
    if (statusSubscribers.size === 1) {
      startStatusPolling()
    }

    // Send current status immediately
    if (lastTownStatus) {
      ws.send(JSON.stringify({
        type: 'status-update',
        changes: [{ type: 'full', data: lastTownStatus }],
        timestamp: Date.now(),
        fullStatus: lastTownStatus,
      }))
    } else {
      // Fetch and send initial status
      try {
        const status = await getTownStatus()
        lastTownStatus = status
        ws.send(JSON.stringify({
          type: 'status-update',
          changes: [{ type: 'full', data: status }],
          timestamp: Date.now(),
          fullStatus: status,
        }))
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to fetch initial status',
        }))
      }
    }

    ws.on('close', () => {
      console.log('Status subscriber disconnected')
      statusSubscribers.delete(ws)
      // Stop polling if no more subscribers
      if (statusSubscribers.size === 0) {
        stopStatusPolling()
      }
    })

    ws.on('error', () => {
      statusSubscribers.delete(ws)
      if (statusSubscribers.size === 0) {
        stopStatusPolling()
      }
    })

    // Handle ping/pong for keepalive
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      } catch {
        // Ignore invalid messages
      }
    })

    return
  }

  // Handle agent terminal connections (existing behavior)
  const agentName = query.agent as string
  const agentType = (query.type as AgentType) || 'polecat'
  const rig = (query.rig as string) || null

  if (!agentName) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Missing agent parameter',
    }))
    ws.close()
    return
  }

  const tmuxSession = getTmuxSessionName(agentType, agentName, rig)
  console.log(`Client connected: ${agentName} (${agentType}) -> tmux:${tmuxSession}`)

  const state: ClientState = {
    agentName,
    agentType,
    rig,
    tmuxSession,
    lastContent: '',
    pollInterval: null,
  }
  clients.set(ws, state)

  // Check if session exists
  const exists = await sessionExists(tmuxSession)

  ws.send(JSON.stringify({
    type: 'status',
    connected: exists,
    tmuxSession,
    agentName,
    agentType,
    rig,
  }))

  if (exists) {
    startPolling(ws, state)
  }

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())

      switch (message.type) {
        case 'command':
          if (message.command) {
            try {
              await sendToTmux(state.tmuxSession, message.command)
              ws.send(JSON.stringify({
                type: 'command-sent',
                command: message.command,
              }))
            } catch (error) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to send command: ${error}`,
              }))
            }
          }
          break

        case 'refresh':
          // Re-check session status
          const nowExists = await sessionExists(state.tmuxSession)
          ws.send(JSON.stringify({
            type: 'status',
            connected: nowExists,
            tmuxSession: state.tmuxSession,
            agentName: state.agentName,
            agentType: state.agentType,
            rig: state.rig,
          }))
          if (nowExists) {
            state.lastContent = ''
            startPolling(ws, state)
          } else {
            stopPolling(state)
          }
          break

        case 'start':
          try {
            const alreadyExists = await sessionExists(state.tmuxSession)
            if (alreadyExists) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `Session "${state.tmuxSession}" is already running`,
              }))
            } else {
              const result = await startAgent(state.agentType, state.rig)
              ws.send(JSON.stringify({
                type: 'session-started',
                message: result,
              }))
              // Wait a moment for session to start
              await new Promise(resolve => setTimeout(resolve, 1000))
              // Update status
              const started = await sessionExists(state.tmuxSession)
              ws.send(JSON.stringify({
                type: 'status',
                connected: started,
                tmuxSession: state.tmuxSession,
                agentName: state.agentName,
                agentType: state.agentType,
                rig: state.rig,
              }))
              if (started) {
                state.lastContent = ''
                startPolling(ws, state)
              }
            }
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: `Failed to start: ${error}`,
            }))
          }
          break

        case 'stop':
          try {
            const isRunning = await sessionExists(state.tmuxSession)
            if (!isRunning) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `Session "${state.tmuxSession}" is not running`,
              }))
            } else {
              stopPolling(state)
              const result = await stopAgent(state.agentType, state.rig)
              ws.send(JSON.stringify({
                type: 'session-stopped',
                message: result,
              }))
              ws.send(JSON.stringify({
                type: 'status',
                connected: false,
                tmuxSession: state.tmuxSession,
                agentName: state.agentName,
                agentType: state.agentType,
                rig: state.rig,
              }))
            }
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: `Failed to stop: ${error}`,
            }))
          }
          break

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }))
          break
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Invalid message: ${error}`,
      }))
    }
  })

  ws.on('close', () => {
    console.log(`Client disconnected: ${agentName}`)
    stopPolling(state)
    clients.delete(ws)
  })

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${agentName}:`, error)
    stopPolling(state)
    clients.delete(ws)
  })
})

process.on('SIGINT', () => {
  console.log('\nShutting down...')
  clients.forEach((state, ws) => {
    stopPolling(state)
    ws.close()
  })
  wss.close()
  process.exit(0)
})
