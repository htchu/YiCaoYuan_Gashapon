import { Pool } from "pg";

let pool: Pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export default getPool();
