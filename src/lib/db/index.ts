import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Only read DATABASE_URL when the function is actually called, not at module load time
const getConnectionString = () => process.env.DATABASE_URL;

const createClient = () => {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Please configure the environment variable.");
  }
  // For Neon pooler endpoint, use prepare: false
  // This disables prepared statements but ensures compatibility
  return postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
  });
};

type DrizzleDb = PostgresJsDatabase<typeof schema>;

declare global {
  var __db__: DrizzleDb | undefined;
  var __sql__: ReturnType<typeof postgres> | undefined;
}

let sqlInstance: ReturnType<typeof postgres> | undefined;
let dbInstance: DrizzleDb | undefined;

export const db = (): DrizzleDb => {
  if (dbInstance) return dbInstance;
  
  if (!sqlInstance) {
    sqlInstance = createClient();
    globalThis.__sql__ = sqlInstance;
  }
  
  dbInstance = drizzle(sqlInstance, { schema });
  globalThis.__db__ = dbInstance;
  
  return dbInstance;
};

export const sql = (): ReturnType<typeof postgres> => {
  if (sqlInstance) return sqlInstance;
  sqlInstance = createClient();
  globalThis.__sql__ = sqlInstance;
  return sqlInstance;
};
