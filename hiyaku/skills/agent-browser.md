# Agent Browser

**Status:** ✅ Active  
**Created:** 2026-02-05  
**Location:** `~/.clawdbot/skills/agent-browser/`

## Purpose

Browser automation CLI for AI agents. Enables programmatic web interaction including navigation, form filling, clicking, screenshots, and data extraction.

## Triggers

- "Open [website]"
- "Fill out this form"
- "Click [button]"
- "Take a screenshot"
- "Scrape data from [page]"
- "Login to [site]"
- "Automate [web task]"

## Capabilities

- Navigate to URLs
- Take snapshots (DOM tree) and screenshots
- Click elements by reference
- Type into inputs
- Fill forms
- Extract structured data
- Handle authentication flows

## Usage

Uses Clawdbot's browser tool with either:
- `profile="clawd"` - Isolated managed browser
- `profile="chrome"` - Chrome extension relay (user's existing tabs)

## Common Patterns

```
1. Open URL → snapshot → identify elements
2. Click/type using refs from snapshot
3. Wait for navigation → snapshot again
4. Extract data or take screenshot
```

## Limitations

- Some sites block automation
- CAPTCHAs require human intervention
- Session cookies may expire
