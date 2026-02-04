# Spitfire (Goose) — Config Changes from Default

**Agent:** Spitfire (`tfspitfirebot`)
**Host:** `spitfire` (65.108.80.195)
**Date:** 2026-01-28
**Clawdbot Version:** 2026.1.24-3

---

## Config Changes (from default `clawdbot onboard`)

### 1. Memory Search — Enabled with Session Memory
```json
"agents.defaults.memorySearch": {
  "enabled": true,
  "sources": ["memory", "sessions"],
  "experimental": {
    "sessionMemory": true
  }
}
```
- Enables vector search over `MEMORY.md` and `memory/*.md`
- Indexes session transcripts as a memory source
- Experimental session memory indexing turned on

### 2. Compaction — Memory Flush Before Compaction
```json
"agents.defaults.compaction": {
  "mode": "safeguard",
  "memoryFlush": {
    "enabled": true
  }
}
```
- Before context compaction, flushes important context to memory files
- Safeguard mode (default) preserved

### 3. Context Pruning — Cache TTL
```json
"agents.defaults.contextPruning": {
  "mode": "cache-ttl",
  "ttl": "1h"
}
```
- Prunes stale cached context after 1 hour

### 4. Heartbeat — 1 Hour Interval
```json
"agents.defaults.heartbeat": {
  "every": "1h"
}
```

### 5. Concurrency
```json
"agents.defaults.maxConcurrent": 4,
"agents.defaults.subagents.maxConcurrent": 8
```

### 6. Web Search — Brave API
```json
"tools.web.search": {
  "provider": "brave",
  "apiKey": "<BRAVE_API_KEY>"
}
```

### 7. TTS — ElevenLabs (Always On)
```json
"messages.tts": {
  "auto": "always",
  "provider": "elevenlabs",
  "elevenlabs": {
    "apiKey": "<ELEVENLABS_API_KEY>",
    "voiceId": "pMsXgVXv3BLzUgSXRplE",
    "modelId": "eleven_multilingual_v2"
  }
}
```

### 8. Reactions — Group Mentions Only
```json
"messages.ackReactionScope": "group-mentions"
```

### 9. Telegram Channel Config
```json
"channels.telegram": {
  "enabled": true,
  "dmPolicy": "allowlist",
  "groupPolicy": "allowlist",
  "streamMode": "partial",
  "groups": {
    "-1003530307560": { "enabled": true }
  }
}
```

---

## Cron Jobs Active

| Name | Schedule | Target | Description |
|------|----------|--------|-------------|
| `moltbot-updates-scan` | Every 6h | Hiyaku TG group | Moltbot/Clawdbot latest updates, skills, business use cases |
| `iran-situation-report` | Every 8h | Hiyaku TG group | Iran political/protest situation report |
| `socal-weather-morning` | 5 AM PT daily | Hiyaku TG group | Encinitas + Irvine weather forecast |
| `ai-trends-morning` | 6 AM PT daily | Thomas DM | AI trends & opportunities briefing |
| `ai-trends-evening` | 6 PM PT daily | Thomas DM | AI trends & opportunities briefing |

---

## To Replicate on Another Agent

1. Run `clawdbot onboard --install-daemon` on the new host
2. Apply these config patches via `config.patch`:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "sources": ["memory", "sessions"],
        "experimental": { "sessionMemory": true }
      },
      "compaction": {
        "mode": "safeguard",
        "memoryFlush": { "enabled": true }
      },
      "contextPruning": { "mode": "cache-ttl", "ttl": "1h" },
      "heartbeat": { "every": "1h" },
      "maxConcurrent": 4,
      "subagents": { "maxConcurrent": 8 }
    }
  },
  "tools": {
    "web": {
      "search": { "provider": "brave", "apiKey": "<YOUR_BRAVE_KEY>" }
    }
  },
  "messages": {
    "ackReactionScope": "group-mentions",
    "tts": {
      "auto": "always",
      "provider": "elevenlabs",
      "elevenlabs": {
        "apiKey": "<YOUR_ELEVENLABS_KEY>",
        "voiceId": "pMsXgVXv3BLzUgSXRplE",
        "modelId": "eleven_multilingual_v2"
      }
    }
  }
}
```

3. Set up Telegram channel + groups via `clawdbot channels login`
4. Recreate cron jobs as needed
