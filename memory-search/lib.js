import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(import.meta.dirname, 'memory.db');
const MEMORY_DIR = path.resolve(import.meta.dirname, '..', 'memory');
const PARENT_DIR = path.resolve(import.meta.dirname, '..');
const EMBEDDING_DIM = 1536;

export function getDb() {
  const db = new Database(DB_PATH);
  sqliteVec.load(db);
  return db;
}

export function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file TEXT NOT NULL,
      heading TEXT,
      content TEXT NOT NULL,
      embedding BLOB
    )
  `);
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks USING vec0(
      embedding float[${EMBEDDING_DIM}]
    )
  `);
}

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI();
}

export async function embed(openai, texts) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return res.data.map(d => new Float32Array(d.embedding));
}

export function discoverFiles() {
  const files = [];
  // Parent-level files
  for (const name of ['MEMORY.md', 'SOUL.md', 'USER.md']) {
    const p = path.join(PARENT_DIR, name);
    if (fs.existsSync(p)) files.push(p);
  }
  // Memory directory .md files
  if (fs.existsSync(MEMORY_DIR)) {
    for (const f of fs.readdirSync(MEMORY_DIR)) {
      if (f.endsWith('.md')) files.push(path.join(MEMORY_DIR, f));
    }
  }
  return files;
}

export function chunkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(PARENT_DIR, filePath);
  const chunks = [];
  
  // Split by headings
  const sections = content.split(/^(#{1,4}\s+.+)$/m);
  
  let currentHeading = path.basename(filePath, '.md');
  let currentText = '';
  
  for (const section of sections) {
    if (/^#{1,4}\s+/.test(section)) {
      // Flush previous
      if (currentText.trim()) {
        for (const chunk of splitLong(currentText.trim(), currentHeading)) {
          chunks.push({ file: relPath, heading: chunk.heading, content: chunk.content });
        }
      }
      currentHeading = section.replace(/^#+\s+/, '').trim();
      currentText = '';
    } else {
      currentText += section;
    }
  }
  // Flush last
  if (currentText.trim()) {
    for (const chunk of splitLong(currentText.trim(), currentHeading)) {
      chunks.push({ file: relPath, heading: chunk.heading, content: chunk.content });
    }
  }
  
  // If no chunks were created, add the whole file as one chunk
  if (chunks.length === 0 && content.trim()) {
    chunks.push({ file: relPath, heading: currentHeading, content: content.trim() });
  }
  
  return chunks;
}

function splitLong(text, heading, maxChars = 2000) {
  if (text.length <= maxChars) return [{ heading, content: text }];
  const results = [];
  let i = 0;
  let part = 1;
  while (i < text.length) {
    results.push({
      heading: `${heading} (part ${part})`,
      content: text.slice(i, i + maxChars),
    });
    i += maxChars;
    part++;
  }
  return results;
}
