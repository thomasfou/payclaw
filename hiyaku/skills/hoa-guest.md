# HOA Guest Manager

**Status:** ✅ Active  
**Created:** 2026-02-07  
**Location:** `~/.clawdbot/skills/hoa-guest/`

## Purpose

Add and manage guests on Thomas's HOA visitor management portal (DwellingLive/FRONTSTEPS) for The Summit at Turtle Ridge.

## Triggers

- "Add a guest"
- "Add [name] to the gate list"
- "I have a visitor coming"
- "Add contractor access"

## Workflow

1. Collect guest details (name, date/time, vehicle if needed)
2. Login to DwellingLive portal via browser automation
3. Navigate to visitor management
4. Add guest with appropriate access level
5. Confirm success

## Access Levels

- **Guest** - Standard visitor
- **Contractor** - Service providers
- **Delivery** - Package/food delivery

## Notes

- Requires browser automation (clawd profile)
- Portal session may expire; re-auth as needed
- Can set recurring access for regular visitors
