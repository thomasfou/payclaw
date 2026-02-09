# Agent Command Center - Claude Code Prompt v2

**Key improvements over v1:**
- Self-verification gates at each phase
- Test-first requirements built into deliverables  
- Performance checkpoints (not afterthoughts)
- Explicit "check your work" steps
- Dedicated refactor phase after MVP

Copy everything below the line:

---

## Project: Agent Command Center

Build a web dashboard for monitoring and managing multiple Clawdbot/OpenClaw AI agent instances across different hosts.

### Development Philosophy

**DO NOT proceed to the next phase until:**
1. All tests for current phase are written AND passing
2. You've manually tested the feature in the browser/terminal
3. You've reviewed your own code for obvious issues
4. Performance implications have been considered

**Think before implementing:**
- What could go wrong?
- What edge cases exist?
- What will break at scale (100+ agents)?
- What's the simplest solution that works?

---

### Tech Stack (Required)
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + shadcn/ui
- Charts: Recharts
- Terminal: xterm.js + xterm-addon-fit + xterm-addon-web-links
- Backend: Bun (or Node.js if unavailable)
- WebSocket: native Bun WS or 'ws' package
- SSH: ssh2 package
- Database: SQLite with Drizzle ORM
- Testing: Vitest (unit) + Playwright (e2e)
- Auth: Simple session-based (single admin password for MVP)

---

## Phase 1: Foundation

### 1A. Backend Core (Backend Dev)

**Deliverables:**
1. Initialize Bun project in `/backend`
2. Set up Drizzle with SQLite (schema below)
3. Implement CRUD routes for `/api/agents`
4. Add CORS middleware

**Tests required BEFORE proceeding:**
```typescript
// backend/src/__tests__/agents.test.ts
describe('Agents API', () => {
  it('POST /api/agents creates agent and returns it')
  it('GET /api/agents returns all agents')
  it('GET /api/agents/:id returns single agent')
  it('GET /api/agents/:id returns 404 for missing agent')
  it('PATCH /api/agents/:id updates agent')
  it('DELETE /api/agents/:id removes agent')
  it('rejects invalid gatewayUrl format')
  it('encrypts gatewayToken before storing')
})
```

**Self-check before completing:**
- [ ] Can you create an agent via curl?
- [ ] Does the 404 case actually return 404?
- [ ] Is the token encrypted in the database? (SELECT and verify)
- [ ] What happens if you POST invalid JSON?

### 1B. Frontend Shell (Frontend Dev)

**Deliverables:**
1. Initialize Vite + React + TypeScript in `/frontend`
2. Install Tailwind CSS + shadcn/ui
3. Create layout with sidebar nav
4. Build `AgentCard` component
5. Build `Dashboard` page (grid of cards)
6. Create typed API client in `/lib/api.ts`

**Tests required BEFORE proceeding:**
```typescript
// frontend/src/__tests__/AgentCard.test.tsx
describe('AgentCard', () => {
  it('renders agent name and host')
  it('shows green dot for online status')
  it('shows red dot for offline status')
  it('shows yellow dot for degraded status')
  it('displays "unknown" when lastSeen is null')
  it('formats lastSeen as relative time')
})

// frontend/src/__tests__/Dashboard.test.tsx  
describe('Dashboard', () => {
  it('renders loading state initially')
  it('renders all agents as cards')
  it('shows empty state when no agents')
  it('refetches on interval')
})
```

**Self-check before completing:**
- [ ] Does the dashboard render with mock data?
- [ ] Do all status colors display correctly?
- [ ] What happens when API is down? (kill backend, reload)
- [ ] Is the layout responsive on mobile?

---

## Phase 2: Core Features

### 2A. Agent Polling & Status (Backend Dev)

**Deliverables:**
1. Poller service that fetches from each agent every 30s
2. Store metrics snapshots in `metrics` table
3. `/api/agents/:id/metrics?range=24h` endpoint
4. WebSocket `/ws/status` for live updates

**Tests required:**
```typescript
describe('Poller', () => {
  it('fetches status from agent gateway')
  it('updates agent status on success')
  it('marks agent offline after 3 failed attempts')
  it('stores metrics snapshot on each poll')
  it('handles gateway timeout gracefully')
})

describe('WebSocket', () => {
  it('broadcasts status changes to connected clients')
  it('handles client disconnect without crashing')
  it('reconnects poller after restart')
})
```

**Performance check:**
- What if you have 100 agents? (polling in parallel vs sequential)
- What if gateway takes 30s to respond? (timeout handling)
- How much disk will metrics consume per day? (add retention/cleanup)

### 2B. Actions & Detail View (Frontend Dev)

**Deliverables:**
1. Agent detail page with status, charts, actions
2. Restart/Upgrade buttons with confirmation modals
3. Token usage chart (Recharts)
4. React Router setup
5. WebSocket integration for live updates
6. "Add Agent" modal

**Tests required:**
```typescript
describe('AgentDetail', () => {
  it('renders agent info from API')
  it('shows confirmation before restart')
  it('disables button during restart')
  it('shows success toast after restart')
  it('shows error toast on failure')
})

describe('TokenChart', () => {
  it('renders with no data')
  it('renders with sample metrics')
  it('updates when new data arrives via WebSocket')
})
```

### 2C. SSH Terminal (Terminal Dev)

**Deliverables:**
1. `/ws/terminal/:id` WebSocket endpoint
2. ssh2 connection management
3. Terminal React component with xterm.js
4. Connection lifecycle handling

**Tests required:**
```typescript
describe('Terminal WebSocket', () => {
  it('establishes SSH connection with stored credentials')
  it('forwards keystrokes to SSH')
  it('forwards SSH output to WebSocket')
  it('closes SSH on WebSocket disconnect')
  it('handles SSH connection failure gracefully')
})
```

**Security check:**
- [ ] Are SSH credentials logged anywhere? (they shouldn't be)
- [ ] What happens if user opens 10 terminals? (connection pooling?)
- [ ] Is there a session timeout?

---

## Phase 3: Polish & Refactor

**Before starting Phase 3, STOP and review:**

### Refactor Checklist
- [ ] Run all tests — everything green?
- [ ] Look for duplicated code (extract utilities)
- [ ] Check bundle size (`vite build`, review output)
- [ ] Run TypeScript strict mode — any errors?
- [ ] Review error handling — are errors user-friendly?
- [ ] Check loading states — are there spinners everywhere needed?

### Then complete:
1. Bulk actions (Upgrade All, Restart All)
2. Config viewer (read-only Monaco)
3. Basic auth (password check, session cookie)
4. Docker Compose
5. README with setup

**Final verification:**
- [ ] Fresh `docker compose up` works
- [ ] Can add agent, see status, restart, open terminal
- [ ] Works in Chrome, Firefox, Safari
- [ ] No console errors in production build

---

## Database Schema (Drizzle)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  host: text('host').notNull(),
  gatewayUrl: text('gateway_url').notNull(),
  gatewayToken: text('gateway_token').notNull(), // encrypt at rest!
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

---

## Agent Communication Protocol

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

---

## Success Criteria

- [ ] All tests pass
- [ ] Can add agent, see status update live
- [ ] Restart works with confirmation
- [ ] Upgrade works with confirmation
- [ ] Token chart shows real data
- [ ] SSH terminal connects and works
- [ ] Docker Compose starts everything
- [ ] No TypeScript errors in strict mode
- [ ] Bundle size < 500KB gzipped

---

## Common Mistakes to Avoid

1. **Not testing error paths** — What if gateway is unreachable? What if SSH fails?
2. **Polling without cleanup** — Clear intervals on unmount
3. **WebSocket memory leaks** — Clean up listeners
4. **Storing tokens in plaintext** — Encrypt!
5. **No loading states** — Users hate staring at blank screens
6. **Ignoring mobile** — Test responsive design early
