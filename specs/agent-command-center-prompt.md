# Agent Command Center - Claude Code Agent Teams Prompt

Copy everything below the line and send to Agent Teams:

---

## Project: Agent Command Center

Build a web dashboard for monitoring and managing multiple Clawdbot/OpenClaw AI agent instances across different hosts.

### Team Structure

**Team Lead** - Coordinates, reviews PRs, handles integration
**Frontend Dev** - React dashboard and components  
**Backend Dev** - API server, polling, and database
**Terminal Dev** - SSH proxy and xterm.js integration

### Tech Stack (Required)
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + shadcn/ui components
- Charts: Recharts
- Terminal: xterm.js + xterm-addon-fit + xterm-addon-web-links
- Backend: Bun (or Node.js if Bun unavailable)
- WebSocket: native Bun WS or 'ws' package
- SSH: ssh2 package
- Database: SQLite with Drizzle ORM
- Auth: Simple session-based (single admin password for MVP)

### Deliverables

#### Phase 1: Foundation (Frontend Dev + Backend Dev in parallel)

**Frontend Dev:**
1. Initialize Vite + React + TypeScript project in `/frontend`
2. Install and configure Tailwind CSS + shadcn/ui
3. Create layout shell with sidebar navigation
4. Build `AgentCard` component (displays: name, status dot, model, token count, last seen)
5. Build `Dashboard` component (grid of AgentCards)
6. Create API client (`/lib/api.ts`) with typed methods

**Backend Dev:**
1. Initialize Bun project in `/backend`
2. Set up Drizzle with SQLite
3. Create schema:
   - `agents` table: id, name, host, gatewayUrl, gatewayToken (encrypted), sshHost, sshUser, sshKeyPath, status, lastSeen, version, model, createdAt, updatedAt
   - `metrics` table: id, agentId, timestamp, tokensIn, tokensOut, cost, activeSessions, uptime
   - `events` table: id, agentId, timestamp, type, message
4. Implement CRUD routes for `/api/agents`
5. Implement poller service that fetches status from each agent every 30 seconds
6. Add CORS middleware for frontend

#### Phase 2: Actions & Metrics (All devs)

**Backend Dev:**
1. Add `/api/agents/:id/restart` - POSTs to agent's gateway with `action: restart`
2. Add `/api/agents/:id/upgrade` - POSTs to agent's gateway with `action: update.run`
3. Add `/api/agents/:id/config` - GET/PATCH for config management
4. Store metrics snapshots from poller, expose `/api/agents/:id/metrics?range=24h`
5. Add WebSocket endpoint `/ws/status` for live status updates

**Frontend Dev:**
1. Build `AgentDetail` page with:
   - Full status display
   - Restart/Upgrade buttons with confirmation modals
   - Token usage chart (Recharts line graph)
2. Add routing (React Router)
3. Connect to `/ws/status` for live updates
4. Add "Add Agent" modal with form

**Terminal Dev:**
1. Research ssh2 + WebSocket bridging
2. Implement `/ws/terminal/:id` WebSocket endpoint in backend
3. Create `Terminal` component with xterm.js
4. Handle connection lifecycle (connect, disconnect, reconnect)

#### Phase 3: Polish

**All:**
1. Add bulk actions (Upgrade All, Restart All)
2. Config editor with Monaco (read-only first, then editable)
3. Error handling and loading states everywhere
4. Basic auth (password check on login, session cookie)
5. Docker Compose for easy deployment
6. README with setup instructions

### Agent Communication Protocol

Each Clawdbot agent exposes a gateway API. To communicate:

```typescript
// Check status
const response = await fetch(`${agent.gatewayUrl}/api/gateway`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${agent.gatewayToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'config.get' })
});

// Restart
await fetch(`${agent.gatewayUrl}/api/gateway`, {
  method: 'POST',
  headers: { /* same */ },
  body: JSON.stringify({ action: 'restart' })
});

// Upgrade
await fetch(`${agent.gatewayUrl}/api/gateway`, {
  method: 'POST', 
  headers: { /* same */ },
  body: JSON.stringify({ action: 'update.run' })
});
```

### Database Schema (Drizzle)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  host: text('host').notNull(),
  gatewayUrl: text('gateway_url').notNull(),
  gatewayToken: text('gateway_token').notNull(), // encrypt this
  sshHost: text('ssh_host'),
  sshUser: text('ssh_user'),
  sshKeyPath: text('ssh_key_path'),
  status: text('status', { enum: ['online', 'offline', 'degraded', 'unknown'] }).default('unknown'),
  lastSeen: integer('last_seen', { mode: 'timestamp' }),
  version: text('version'),
  model: text('model'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const metrics = sqliteTable('metrics', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  tokensIn: integer('tokens_in').default(0),
  tokensOut: integer('tokens_out').default(0),
  cost: real('cost').default(0),
  activeSessions: integer('active_sessions').default(0),
  uptime: integer('uptime').default(0),
});
```

### UI Reference

Dashboard should look like a clean admin panel:
- Dark mode preferred
- Status indicators: green dot = online, yellow = degraded, red = offline
- Cards should show key info at a glance
- Detail page should have tabs or sections for different data
- Terminal should be full-width, dark background

### File Structure

```
agent-command-center/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   └── index.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Success Criteria

- [ ] Can add an agent with gateway URL + token
- [ ] Dashboard shows real-time status of all agents
- [ ] Can restart an agent from the UI
- [ ] Can upgrade an agent from the UI
- [ ] Can view token usage over time as a chart
- [ ] Can open SSH terminal to an agent's host
- [ ] Works in Docker

### Notes

- Start with mock data if needed, but wire up real agent communication ASAP
- Gateway tokens are sensitive - encrypt at rest
- Agents may be behind NAT/firewalls - document that users need tunnels (Tailscale, ngrok) for remote agents
- Keep it simple for MVP - no user management, just single admin
