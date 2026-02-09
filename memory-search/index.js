#!/usr/bin/env node
import { getDb, initDb, getOpenAI, embed, discoverFiles, chunkFile } from './lib.js';

const BATCH_SIZE = 50;

async function main() {
  const db = getDb();
  initDb(db);
  const openai = getOpenAI();

  // Clear existing data
  db.exec('DELETE FROM chunks');
  db.exec('DELETE FROM vec_chunks');

  const files = discoverFiles();
  console.log(`Found ${files.length} files to index`);

  const allChunks = [];
  for (const f of files) {
    const chunks = chunkFile(f);
    allChunks.push(...chunks);
    console.log(`  ${f} → ${chunks.length} chunks`);
  }

  console.log(`Total chunks: ${allChunks.length}`);
  console.log('Embedding...');

  const insertChunk = db.prepare('INSERT INTO chunks (file, heading, content, embedding) VALUES (?, ?, ?, ?)');
  const insertVec = db.prepare('INSERT INTO vec_chunks (rowid, embedding) VALUES (?, ?)');

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => `${c.heading}\n${c.content}`);
    const embeddings = await embed(openai, texts);

    const tx = db.transaction(() => {
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const embBuf = Buffer.from(embeddings[j].buffer);
        const info = insertChunk.run(c.file, c.heading, c.content, embBuf);
        insertVec.run(info.lastInsertRowid, embeddings[j]);
      }
    });
    tx();
    console.log(`  Embedded ${Math.min(i + BATCH_SIZE, allChunks.length)}/${allChunks.length}`);
  }

  console.log('Done! Database saved to memory.db');
  db.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
