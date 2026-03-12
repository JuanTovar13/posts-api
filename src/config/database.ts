import { Pool } from 'pg';
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DB_NAME } from './index';

export const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});
