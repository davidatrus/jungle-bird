// src/lib/db.ts
import { Pool } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in environment variables.');
  }

  // Reuse pool across hot reloads in dev
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool({
      connectionString: databaseUrl,
      // Supabase requires SSL for remote connections
      ssl: { rejectUnauthorized: false },
    });
  }

  return globalThis.__pgPool;
}

export const pool = getPool();
