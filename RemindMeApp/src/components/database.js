import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Calendar',
  password: 'bazepodataka',
  port: 5432, 
});

export default pool;
