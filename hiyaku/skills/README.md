# Hiyaku Skills & Tools

Internal capabilities developed by Hiyaku for AI agent workflows.

## Active Skills

| Skill | Description | Status | Location |
|-------|-------------|--------|----------|
| [Prompt Collector](./prompt-collector.md) | Collect, organize, and manage AI prompts from various sources | ✅ Active | `~/.clawdbot/skills/prompt-collector/` |
| [HOA Guest Manager](./hoa-guest.md) | Add/manage guests on HOA visitor portal (DwellingLive/FRONTSTEPS) | ✅ Active | `~/.clawdbot/skills/hoa-guest/` |
| [Agent Browser](./agent-browser.md) | Browser automation CLI for AI agents | ✅ Active | `~/.clawdbot/skills/agent-browser/` |

## Research & Documentation

| Document | Description | Location |
|----------|-------------|----------|
| Vertical Analyses | Deep-dive market research for 7 verticals | `/hiyaku/verticals/` |
| Market Research Report | ICP, competitors, go-to-market strategy | `/hiyaku-market-research-report.md` |
| Crust Agreement | OpenClaw partnership agreement | `/hiyaku-crust-agreement.md` |

## Verticals Covered

1. **InfoSec & Compliance** - vCISOs, GRC consultants
2. **Legal** - Small/mid law firms
3. **Healthcare** - Clinics, practices, dental
4. **Real Estate** - Brokerages, property management
5. **Financial Services** - RIAs, accounting, tax
6. **E-commerce** - DTC brands, Shopify stores
7. **Professional Services** - Agencies, consultancies

## Development Workflow

When building new skills:
1. Create skill folder in `~/.clawdbot/skills/{skill-name}/`
2. Write `SKILL.md` with triggers, workflow, and rules
3. Document in this index
4. Test in live sessions

## Skill Template

```markdown
# Skill Name

## When to Use
[Triggers and use cases]

## Workflow
[Step by step process]

## Commands
[User phrases that activate this skill]

## Rules
[Constraints and guidelines]
```
