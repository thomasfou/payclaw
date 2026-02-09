# Agent Command Center - Technical Specification

## Overview

A centralized dashboard for monitoring and managing multiple Clawdbot/OpenClaw instances across different hosts. Think "Portainer for AI agents."

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Agent Command Center                          │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND (React + TypeScript)                                       │
│  ├── Dashboard View (grid of agent cards)                           │
│  ├── Agent Detail View (single agent deep-dive)                     │
│  ├── Terminal View (embedded SSH via xterm.js)                      │
│  ├── Config Editor (Monaco editor for YAML/MD files)                │
│  └── Metrics View (usage charts over time)                          │
├─────────────────────────────────────────────────────────────────────┤
│  BACKEND (Node.js/Express or Bun)                                   │
│  ├── Agent Registry (stores connection info per agent)              │
│  ├── Poller Service (fetches status from each agent periodically)   │
│  ├── Metrics Aggregator (collects/stores token usage over time)     │
│  ├── WebSocket Hub (proxies SSH connections, live status updates)   │
│  └── Action Dispatcher (triggers upgrades, restarts, config pushes) │
├─────────────────────────────────────────────────────────────────────┤
│  DATABASE (SQLite or Postgres)                                      │
│  ├── agents (id, name, host, gateway_url, gateway_token, ssh_*)     │
│  ├── metrics (agent_id, timestamp, tokens_in, tokens_out, cost)     │
│  └── events (agent_id, timestamp, type, message)                    │
└─────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Agent 1  │        │ Agent 2  │        │ Agent N  │
    │ Spitfire │        │ Goose    │        │ ...      │
    │ (Thomas) │        │ (Client) │        │          │
    └──────────┘        └──────────┘        └──────────┘
```

---

## Data Model

### Agent Registry Entry
```typescript
interface Agent {
  id: string;                    // UUID
  name: string;                  // Display name (e.g., "Spitfire")
  host: string;                  // Hostname for display
  gatewayUrl: string;            // http://hostname:3030 or tunnel URL
  gatewayToken: string;          // Auth token (encrypted at rest)
  sshHost?: string;              // SSH connection string
  sshUser?: string;
  sshKeyPath?: string;           // Path to private key on command center
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  lastSeen: Date;
  version?: string;              // Clawdbot version
  model?: string;                // Current model in use
  createdAt: Date;
  updatedAt: Date;
}
```

### Metrics Entry
```typescript
interface MetricSnapshot {
  id: string;
  agentId: string;
  timestamp: Date;
  tokensIn: number;              // Input tokens since last snapshot
  tokensOut: number;             // Output tokens since last snapshot
  cost: number;                  // Estimated cost in USD
  activeSessions: number;
  uptime: number;                // Seconds since gateway start
}
```

---

## Existing Clawdbot APIs to Leverage

Each Clawdbot instance already exposes these via the gateway:

### 1. Status Endpoint
```bash
# Via gateway tool
gateway action=config.get → returns full config + runtime info

# Or via HTTP (if gateway HTTP API enabled)
GET http://<gateway>:3030/api/status
```

### 2. Session List
```bash
# Via gateway
sessions_list → returns active sessions with last messages
session_status → returns token usage for a session
```

### 3. Update Mechanism
```bash
gateway action=update.run → pulls latest, restarts
gateway action=restart → restarts gateway
```

### 4. Config Management
```bash
gateway action=config.get → fetch current config
gateway action=config.patch → partial config update
gateway action=config.apply → full config replacement
```

---

## Frontend Components

### 1. Dashboard Grid
- Card per agent showing:
  - Name + status indicator (green/yellow/red dot)
  - Current model
  - Token usage (today)
  - Last activity time
  - Quick actions: Terminal, Restart, Upgrade

### 2. Agent Detail Page
- Full status dump
- Token usage chart (line graph over time)
- Recent sessions list
- Workspace file browser (SOUL.md, MEMORY.md, etc.)
- Config viewer/editor

### 3. Terminal Embed
- xterm.js + WebSocket proxy
- SSH connection to agent's host
- Supports `clawdbot` CLI commands directly

### 4. Bulk Actions
- "Upgrade All" button (with confirmation)
- "Restart All" button
- Version comparison across fleet

---

## Backend Services

### 1. Poller Service
```typescript
// Every 30 seconds, poll each registered agent
async function pollAgent(agent: Agent): Promise<void> {
  try {
    const status = await fetch(`${agent.gatewayUrl}/api/status`, {
      headers: { 'Authorization': `Bearer ${agent.gatewayToken}` }
    });
    
    if (status.ok) {
      const data = await status.json();
      await updateAgentStatus(agent.id, 'online', data);
      await recordMetrics(agent.id, data.metrics);
    } else {
      await updateAgentStatus(agent.id, 'degraded');
    }
  } catch (e) {
    await updateAgentStatus(agent.id, 'offline');
  }
}
```

### 2. SSH Proxy (WebSocket)
```typescript
// WebSocket endpoint that proxies to SSH
// Frontend sends terminal input → WS → SSH → WS → Frontend
// Use 'ssh2' npm package for SSH connections
```

### 3. Action Dispatcher
```typescript
// Trigger actions on remote agents
async function upgradeAgent(agentId: string): Promise<void> {
  const agent = await getAgent(agentId);
  await fetch(`${agent.gatewayUrl}/api/gateway`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${agent.gatewayToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'update.run' })
  });
}
```

---

## Security Considerations

1. **Token Storage**: Gateway tokens encrypted at rest (use `libsodium` or similar)
2. **SSH Keys**: Never store in database; reference paths only
3. **Auth**: Command center itself needs auth (session-based or API key)
4. **Network**: Agents may be behind NAT; need tunnel support (Tailscale, ngrok, Cloudflare Tunnel)

---

## Tech Stack Recommendation

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | React 18 + TypeScript | Standard, good ecosystem |
| Styling | Tailwind CSS + shadcn/ui | Fast development, clean look |
| Charts | Recharts | React-native, good for time series |
| Terminal | xterm.js + xterm-addon-fit | Industry standard |
| Editor | Monaco Editor | VSCode quality for config editing |
| Backend | Bun or Node.js + Express | Fast, TypeScript native |
| WebSocket | ws (Node) or Bun native | SSH proxy, live updates |
| SSH | ssh2 (npm) | Mature, well-documented |
| Database | SQLite (libsql/Turso) | Simple, embedded, good enough |
| ORM | Drizzle | Type-safe, lightweight |

---

## MVP Scope (Weekend Build)

**Phase 1: Core Dashboard (Day 1)**
- [ ] Agent registry (add/edit/remove agents)
- [ ] Status polling every 30s
- [ ] Dashboard grid with status cards
- [ ] Basic auth (single admin password)

**Phase 2: Actions (Day 2)**
- [ ] Restart button
- [ ] Upgrade button
- [ ] View config (read-only)
- [ ] Token usage display (current snapshot)

**Phase 3: Polish (Day 3)**
- [ ] Metrics over time (charts)
- [ ] SSH terminal embed
- [ ] Config editing
- [ ] Bulk actions

---

## File Structure

```
agent-command-center/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AgentDetail.tsx
│   │   │   ├── Terminal.tsx
│   │   │   └── ConfigEditor.tsx
│   │   ├── hooks/
│   │   │   ├── useAgents.ts
│   │   │   └── useWebSocket.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── agents.ts
│   │   │   ├── metrics.ts
│   │   │   └── actions.ts
│   │   ├── services/
│   │   │   ├── poller.ts
│   │   │   ├── ssh-proxy.ts
│   │   │   └── metrics-collector.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   └── index.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## API Endpoints (Backend)

```
GET    /api/agents              # List all agents
POST   /api/agents              # Add new agent
GET    /api/agents/:id          # Get agent details
PUT    /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Remove agent

GET    /api/agents/:id/status   # Fetch live status
POST   /api/agents/:id/restart  # Trigger restart
POST   /api/agents/:id/upgrade  # Trigger upgrade
GET    /api/agents/:id/config   # Get config
PATCH  /api/agents/:id/config   # Update config

GET    /api/agents/:id/metrics  # Get metrics history
GET    /api/metrics/summary     # Fleet-wide summary

WS     /ws/terminal/:id         # SSH terminal proxy
WS     /ws/status               # Live status updates
```

---

## Notes

- Clawdbot's gateway HTTP API may need to be enabled per-instance
- Consider Tailscale for secure agent connectivity
- Could extend to support non-Clawdbot agents in future (generic status endpoints)
