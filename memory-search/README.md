# Memory Search Prototype

Semantic search over Clawdbot's memory files using OpenAI embeddings + SQLite + sqlite-vec.

## Setup

```bash
cd memory-search
npm install
export OPENAI_API_KEY=sk-...
```

## Usage

### Index memory files
```bash
node index.js
```
Scans `../memory/*.md`, `../MEMORY.md`, `../SOUL.md`, `../USER.md`, chunks by heading, embeds with `text-embedding-3-small`, stores in `memory.db`.

### Search
```bash
node search.js "what happened yesterday"
node search.js "SSH security rules" 10
```
Returns top-k semantically similar chunks with file, heading, and relevance score.

## How it works

1. **Chunking** — splits markdown files by headings; large sections split at ~2000 chars
2. **Embedding** — OpenAI `text-embedding-3-small` (1536 dims)
3. **Storage** — SQLite with `sqlite-vec` extension for vector KNN search
4. **Search** — embed query → KNN match against stored vectors → return top results
