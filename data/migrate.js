import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './mysqlClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../db/migrations');

async function ensureMigrationsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

async function getAppliedMigrations() {
  const [rows] = await pool.query('SELECT name FROM migrations ORDER BY id ASC');
  return new Set(rows.map(r => r.name));
}

function readMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(name, sql) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Split on semicolon at line end; naive but OK for our simple schema
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    await connection.query('INSERT INTO migrations (name) VALUES (?)', [name]);
    await connection.commit();
  } catch (err) {
    try { await connection.rollback(); } catch {}
    throw err;
  } finally {
    connection.release();
  }
}

export async function runMigrations() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = readMigrationFiles();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await applyMigration(file, sql);
    console.log(`[migrate] applied ${file}`);
  }
}

// Allow running as a script: `npm run migrate`
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => { console.log('[migrate] done'); process.exit(0); })
    .catch(err => { console.error('[migrate] failed', err); process.exit(1); });
}