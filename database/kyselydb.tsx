import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { Database } from './structure';

// ============================================================================
// Database Connection Setup
// ============================================================================

/**
 * Global reference to prevent multiple database connections during hot reloads
 * 
 * In Next.js development mode, hot reloading can create multiple connection pools
 * which eventually exhausts the MySQL connection limit. This global singleton
 * pattern ensures only one connection pool exists across reloads.
 */
const globalForKysely = globalThis as unknown as { db: Kysely<Database> };

/**
 * Database connection pool configuration
 * 
 * Uses a singleton pattern to maintain a single connection pool across
 * module reloads, preventing connection exhaustion in development.
 * 
 * @remarks
 * - Connection limit is set to 10 to balance performance and resource usage
 * - All environment variables have fallback defaults for development convenience
 * - The pool handles connection queuing and automatic reconnection
 */
export const db =
    globalForKysely.db ||
    new Kysely<Database | any>({
        dialect: new MysqlDialect({
            pool: createPool({
                host: process.env.DATABASE_HOST || '127.0.0.1',
                user: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSWORD || '',
                database: process.env.DATABASE_NAME || 'defaultcms',
                port: 3306,
                waitForConnections: true,      // Queue requests when connections are unavailable
                connectionLimit: 10,            // Maximum concurrent connections in the pool
                queueLimit: 0,                  // Unlimited queue size (0 = no limit)
            })
        })
    });

/**
 * Type-unsafe database reference for dynamic table operations
 * 
 * Used by utility functions that need to work with any table structure.
 * The `any` type allows dynamic column references and flexible queries
 * while maintaining Kysely's query builder capabilities.
 */
export const ddb = db as Kysely<any>;

/**
 * Persist the database instance globally in development mode
 * 
 * This ensures the same connection pool is reused across hot reloads
 * in Next.js development, preventing connection pool exhaustion.
 * 
 * @remarks
 * - Only applied in non-production environments to avoid memory leaks
 * - Uses globalThis to survive module reloads
 * - Critical for Next.js development with MySQL
 */
if (process.env.NODE_ENV !== 'production') {
    globalForKysely.db = db;
}