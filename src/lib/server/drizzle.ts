import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import {
  VITE_DB_DATABASE, VITE_DB_PASSWORD, VITE_DB_USER, VITE_DB_HOST, VITE_DB_FORWARD_PORT,
} from '$env/static/private';
import * as schema from '../db/schema';
import postgres from 'postgres';

const CONNECTION_DETAILS = {
  host: VITE_DB_HOST === '' ? '127.0.0.1' : VITE_DB_HOST,
  port: Number.parseInt(VITE_DB_FORWARD_PORT === '' ? '5432' : VITE_DB_FORWARD_PORT),
  user: VITE_DB_USER === '' ? 'cicipanel' : VITE_DB_USER,
  password: VITE_DB_PASSWORD === '' ? 'cicipanel' : VITE_DB_PASSWORD,
  database: VITE_DB_DATABASE === '' ? 'cicipanel' : VITE_DB_DATABASE,
};

const migrationClient = postgres({
  ...CONNECTION_DETAILS,
  max: 1,
});

await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });

export const queryClient = postgres(CONNECTION_DETAILS);

export const db = drizzle(queryClient, { schema });
