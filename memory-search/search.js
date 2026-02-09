#!/usr/bin/env node
import { getDb, getOpenAI, embed } from './lib.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(import.meta.dirname, 'memory.db');

async function main() {
  const query = process.argv[2];
  const topK = parseInt(process.argv[3] || '5', 10);

  if (!query) {
    console.log('Usage: node search.js "query" [top_k]');
    console.log('  Searches indexed memory files for semantically similar chunks.');
    console.log('  top_k defaults to 5.');
    process.exit(0);
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error('Database not found. Run `node index.js` first.');
    process.exit(1);
  }

  const db = getDb();
  const openai = getOpenAI();

  const [queryEmbedding] = await embed(openai, [query]);

  const rows = db.prepare(`
    SELECT
      v.rowid,
      v.distance,
      c.file,
      c.heading,
      c.content
    FROM vec_chunks v
    INNER JOIN chunks c ON c.id = v.rowid
    WHERE v.embedding MATCH ?
    ORDER BY v.distance
    LIMIT ?
  `).all(queryEmbedding, topK);

  if (rows.length === 0) {
    console.log('No results found.');
  } else {
    console.log(`\nTop ${rows.length} results for: "${query}"\n`);
    for (const row of rows) {
      const score = (1 - row.distance / 2).toFixed(4); // rough cosine similarity from L2
      console.log(`─────────────────────────────────`);
      console.log(`📄 ${row.file}  §${row.heading}`);
      console.log(`   Score: ${score}  (distance: ${row.distance.toFixed(4)})`);
      console.log(`   ${row.content.slice(0, 200).replace(/\n/g, ' ')}${row.content.length > 200 ? '...' : ''}`);
    }
    console.log(`─────────────────────────────────`);
  }

  db.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
