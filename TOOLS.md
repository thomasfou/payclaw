# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

### Telegram Users
- Thomas Fou → 6909579251 (owner)
- Richard Chung → 8507494023
- Hooman → 5233555093
- deewin1000 → 5248939477

### Telegram Groups
- Hiyaku AI Learning Group → -5109429030 / -1005109429030 (allowFrom: Thomas, Richard)
- WP3 → -5097511309 (crypto updates daily 5:30 PM PT)
- (other groups TBD — IDs: 5177994507, -5192843311, -1003530307560)

### X/Twitter Access
- **oEmbed API** (no auth needed): `https://publish.twitter.com/oembed?url=<tweet_url>`
- Returns tweet text, author, date — works for any public tweet
- Limitation: can't search feeds or browse timelines — only reads specific tweet URLs
- For full feed monitoring, need X API bearer token (TODO: get from Thomas)

### Bookmarks
- **Local file:** `/home/thomas/clawd/bookmarks.md`
- **GitHub repo:** `thomasfou/thomasfou` (profile repo)
- **Push command:** `cp /home/thomas/clawd/bookmarks.md /tmp/thomasfou-profile/ && cd /tmp/thomasfou-profile && git add bookmarks.md && git commit -m "Update bookmarks" && git push`
- **Always push after updates!**

### Research Directives
- **Price/market data freshness:** When pulling pricing data (crypto, stocks, commodities) from articles, ALWAYS check the article date. If older than 24-48 hours, fetch updated data from a real-time source (web search for "[asset] price today") before citing figures.
- **Volatile data = verify:** Any data that moves fast (prices, market caps, TVL, trading volumes) should be cross-checked with current sources, not trusted from background articles.

---

Add whatever helps you do your job. This is your cheat sheet.
