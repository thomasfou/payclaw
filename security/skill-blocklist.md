# Skill Blocklist - Known Malicious Actors & IOCs

**Last updated:** 2026-02-06
**Source:** Snyk security research (<https://snyk.io/articles/clawdhub-malicious-campaign-ai-agent-skills/>)

## 🚫 Blocked ClawHub Users
| Username | Reason | Date Added |
|----------|--------|------------|
| `zaycv` | Published `clawhub` and `clawdhub1` malware campaigns | 2026-02-06 |

## 🚫 Blocked Skills
| Skill Name | Author | Status | Downloads | Threat |
|------------|--------|--------|-----------|--------|
| `clawhub` | zaycv | Removed | 7,743 | Infostealer, reverse shell |
| `clawdhub1` | zaycv | ACTIVE | ~100 | Infostealer, reverse shell |

## 🚫 Blocked GitHub Accounts
| Username | Repo | Reason |
|----------|------|--------|
| `Ddoy233` | `openclawcli` | Hosts password-protected malware zip |

## 🚫 Blocked IPs & Domains
| IP/Domain | Reason |
|-----------|--------|
| `91.92.242.30` | C2 server for macOS payload delivery |
| `glot.io/snippets/hfd3x9ueu5` | Obfuscated bash payload host |

## 🚫 Blocked Patterns
These patterns in SKILL.md files should trigger immediate rejection:

```
# Obfuscated execution
base64 -D | bash
base64 --decode | bash
echo ... | bash
curl ... | bash
wget ... | bash

# Direct IP connections (no domain)
http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+
https://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+

# Password-protected archives (scanner evasion)
"password:" or "Password:" in download instructions
```

## 📋 Vetting Resources
- **mcp-scan:** <https://github.com/invariantlabs-ai/mcp-scan>
- **Snyk AI-BOM:** `snyk aibom`
- **ClawHub reports:** Check skill page for user reports (3+ reports = auto-hidden)

## 📜 Incident History

### 2026-01-27 to 2026-01-29: ClawHub Supply Chain Attack
- **Campaigns:** Multiple malicious skills published
- **Impact:** Hundreds of malicious skills, thousands of affected users
- **Techniques:** Typosquatting, obfuscated payloads, password-protected archives
- **Response:** ClawHub added auto-hide for reported skills

### 2026-02-02: `clawhub` Discovery
- Snyk discovered `clawhub` skill with 7,743 downloads
- Removed Feb 3, attacker returned with `clawdhub1`

---

**To add entries:** Update this file and notify admins.
**To request firewall blocks:** Ask Thomas to run `sudo iptables -A INPUT -s <IP> -j DROP`
