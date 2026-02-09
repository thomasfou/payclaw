# Prompt Collector

**Status:** ✅ Active  
**Created:** 2026-02-09  
**Location:** `~/.clawdbot/skills/prompt-collector/`

## Purpose

Collect, organize, and manage AI prompts from various sources into the Hiyaku prompt library at `/hiyaku/prompts/`.

## Triggers

- User shares a URL containing prompts (X/Twitter, blogs, newsletters)
- "Save this prompt"
- "File this away"
- "Find a prompt for X"

## Workflow

1. **Extract** - Fetch source URL, extract prompt(s)
2. **Classify** - Determine model target (Claude/OpenAI/general), source, tags
3. **Organize** - Save to appropriate directory
4. **Index** - Update README with new entry

## Directory Structure

```
/hiyaku/prompts/
├── README.md
├── claude/           # Claude-optimized (Opus, Sonnet)
├── openai/           # GPT-optimized
├── openclaw/         # OpenClaw agent prompts
└── general/          # Model-agnostic
```

## Quality Bar

Only save prompts that are:
- Actually useful (not generic fluff)
- Well-structured with clear instructions
- From credible sources
- Novel or better than existing saved prompts
